package main

import (
	"fmt"

	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/ec2"
	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/vpc"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi/config"
)

const amiId = "ami-053b0d53c27927902" // Example: Amazon Linux 2 AMI (HVM), SSD Volume Type in us-west-2 (Oregon). Change for your region.
const instanceType = "t2.micro"
const postgresImage = "postgres:17.5-alpine3.22" // postgresql public image from docker hun

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		// --- 0. Configuration & Secrets ---
		cfg := config.New(ctx, "")

		// Retrieve the required secret password for PostgreSQL from Pulumi configuration.
		// Run `pulumi config set --secret dbPassword <your-strong-password>` before deploying.
		dbPassword := cfg.RequireSecret("dbPassword")

		// --- Networking ---
		// Create a new VPC
		mainVpc, err := ec2.NewVpc(ctx, "mainVpc", &ec2.VpcArgs{
			CidrBlock:          pulumi.String("10.0.0.0/16"),
			EnableDnsHostnames: pulumi.Bool(true),
			Tags:               pulumi.StringMap{"Name": pulumi.String("postgres-vpc")},
		})
		if err != nil {
			return err
		}

		// Create an Internet Gateway for public access
		igw, err := ec2.NewInternetGateway(ctx, "igw", &ec2.InternetGatewayArgs{
			VpcId: mainVpc.ID(),
		})
		if err != nil {
			return err
		}

		// Create a public subnet
		publicSubnet, err := ec2.NewSubnet(ctx, "publicSubnet", &ec2.SubnetArgs{
			VpcId:                  mainVpc.ID(),
			CidrBlock:              pulumi.String("10.0.1.0/24"),
			MapPublicIpOnLaunch: pulumi.Bool(true), // Instances in this subnet get a public IP
			AvailabilityZone:       pulumi.String("us-east-1a"), // Change to your region's AZ
		})
		if err != nil {
			return err
		}

		// Create a route table and associate it with the public subnet
		routeTable, err := ec2.NewRouteTable(ctx, "routeTable", &ec2.RouteTableArgs{
			VpcId: mainVpc.ID(),
			Routes: ec2.RouteTableRouteArray{
				&ec2.RouteTableRouteArgs{
					CidrBlock: pulumi.String("0.0.0.0/0"),
					GatewayId: igw.ID(),
				},
			},
		})
		if err != nil {
			return err
		}

		_, err = ec2.NewRouteTableAssociation(ctx, "rta", &ec2.RouteTableAssociationArgs{
			SubnetId:     publicSubnet.ID(),
			RouteTableId: routeTable.ID(),
		})
		if err != nil {
			return err
		}


		// --- EC2 Security Group ---

		// Create a Security Group to allow PostgreSQL traffic (5432) and SSH (22).
		// WARNING: Allowing SSH and PostgreSQL from 0.0.0.0/0 is dangerous. Restrict this in a real environment.
		secGroup, err := ec2.NewSecurityGroup(ctx, "postgres-secgroup", &ec2.SecurityGroupArgs{
			VpcId: mainVpc.ID(),
			Ingress: ec2.SecurityGroupIngressArray{
				&ec2.SecurityGroupIngressArgs{
					Protocol:   pulumi.String("tcp"),
					FromPort:   pulumi.Int(22),
					ToPort:     pulumi.Int(22),
					CidrBlocks: pulumi.StringArray{pulumi.String("0.0.0.0/0")},
					Description: pulumi.String("Allow SSH access"),
				},
				&ec2.SecurityGroupIngressArgs{
					Protocol:   pulumi.String("tcp"),
					FromPort:   pulumi.Int(5432),
					ToPort:     pulumi.Int(5432),
					CidrBlocks: pulumi.StringArray{pulumi.String("0.0.0.0/0")}, // IMPORTANT: Restrict to known IPs
					Description: pulumi.String("Allow PostgreSQL traffic"),
				},
			},
			Egress: ec2.SecurityGroupEgressArray{
				&ec2.SecurityGroupEgressArgs{ // Allow all outbound traffic
					Protocol:   pulumi.String("-1"),
					FromPort:   pulumi.Int(0),
					ToPort:     pulumi.Int(0),
					CidrBlocks: pulumi.StringArray{pulumi.String("0.0.0.0/0")},
				},
			},
			Tags: pulumi.StringMap{"Name": pulumi.String("postgres-secgroup")},
		})
		if err != nil {
			return err
		}

		// --- 4. EC2 UserData and Instance Creation ---

		// Define the bash script to run on instance launch.
		// It installs Docker and runs the PostgreSQL container from Docker Hub.
		userDataScript := dbPassword.ApplyT(func(dbPass string) (string, error) {
			// This script installs Docker and starts the Postgres container.
			// It includes a volume mount for data persistence.
			script := fmt.Sprintf(`#!/bin/bash
sudo yum update -y
sudo amazon-linux-extras install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user
sudo chkconfig docker on

# Pull the PostgreSQL image from Docker Hub and run the container
# -v mounts a volume for data persistence (data will survive container restarts)
sudo docker run --name postgres-server \
-e POSTGRES_PASSWORD=%s \
-p 5432:5432 \
-v /var/lib/postgresql/data:/var/lib/postgresql/data \
-d %s
`, dbPass, postgresImage)
			return script, nil
		}).(pulumi.StringOutput)

		// Create the EC2 Instance (t2.micro - Free Tier)
		server, err := ec2.NewInstance(ctx, "postgresServer", &ec2.InstanceArgs{
			InstanceType:        pulumi.String(instanceType),
			Ami:                 pulumi.String(amiId),
			SubnetId:            publicSubnet.ID(),
			AssociatePublicIpAddress: pulumi.Bool(true),
			VpcSecurityGroupIds: pulumi.StringArray{secGroup.ID()},
			UserData:            userDataScript,
			Tags:                pulumi.StringMap{"Name": pulumi.String("PostgresFreeTierHost")},
			// Note: Replace "your-key-pair-name" with a valid key pair name you created in AWS for SSH access.
			// KeyName: pulumi.String("your-key-pair-name"), 
		})
		if err != nil {
			return err
		}

		// --- 5. Outputs ---
		ctx.Export("PostgresServerPublicIP", server.PublicIp)
		ctx.Export("PostgresPassword", dbPassword) // IMPORTANT: Secret output
		ctx.Export("PostgresImage", pulumi.String(postgresImage))
		ctx.Export("Note", pulumi.String("PostgreSQL is running as a Docker container on the t2.micro instance using the requested image. Remember to use a strong password and restrict the security group for production use."))

		return nil
	})
}

