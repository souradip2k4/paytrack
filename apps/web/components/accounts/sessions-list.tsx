"use client";

import { authClient } from "@budgetbee/core/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Session } from "better-auth";
import { format } from "date-fns";
import { Ellipsis, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@budgetbee/ui/core/badge";
import { Button } from "@budgetbee/ui/core/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@budgetbee/ui/core/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@budgetbee/ui/core/dropdown-menu";

function SessionItem({
	session,
	isCurrentSession = false,
}: {
	session: Session;
	isCurrentSession?: boolean;
}) {
	const queryClient = useQueryClient();
	const { data: authData } = authClient.useSession();

	const { mutate: revokeSession, isPending: isRevoking } = useMutation({
		mutationFn: async (token: string) => {
			const res = await authClient.revokeSession({ token });
			if (res.error) {
				throw new Error(res.error.message);
			}
			return res.data;
		},
		onSuccess: () => {
			toast.success("Session revoked successfully");
			queryClient.invalidateQueries({
				queryKey: ["session", authData?.user.id],
			});
			queryClient.refetchQueries({
				queryKey: ["session", authData?.user.id],
			});
		},
		onError: e => {
			console.log(e);
			toast.error("Failed to revoke session");
		},
	});

	const ua = session.userAgent ?? "";
	const isMobile = session.userAgent?.includes("Mobile");

	const os = (() => {
		const match = /\((.*?);/.exec(ua);
		if (match && match.length > 1) return match[1];
		return "Unknown device";
	})();

	const browser = (() => {
		const match = /\S+$/.exec(ua);
		if (match && match.length > 0) return match[0].replace("/", " ");
		return "";
	})();
	return (
		<div className="flex gap-2">
			<img
				src={isMobile ? "/images/mobile.svg" : "/images/laptop.svg"}
				className="mt-2 h-6 w-6"
			/>
			<div className="grow">
				<div className="inline-flex items-center justify-center">
					<p>{os}</p>
					{isCurrentSession && (
						<Badge
							className="border-border ml-2 rounded-full"
							variant="secondary">
							This device
						</Badge>
					)}
				</div>
				<p className="text-muted-foreground">{browser}</p>
				<p className="text-muted-foreground">{session.ipAddress}</p>
				<p className="text-muted-foreground">
					Last active:{" "}
					{format(new Date(session.updatedAt), "MMMM d, yyyy")}
				</p>
			</div>
			{!isCurrentSession && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => revokeSession(session.id)}
							isLoading={isRevoking}>
							<Ellipsis className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem variant="destructive">
							Sign out this device
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</div>
	);
}

export function SessionsList() {
	const queryClient = useQueryClient();
	const { data: authData, isPending: isSessionLoading } =
		authClient.useSession();
	const { data: allSessions, isLoading: isAllSessionsLoading } = useQuery({
		queryKey: ["session", authData?.user.id],
		queryFn: async () => {
			if (!authData?.user.id) return [];
			const res = await authClient.listSessions();
			if (res.error) {
				toast.error("Failed to retrieve sessions");
				return [];
			}
			return res.data;
		},
		enabled: !isSessionLoading && !!authData?.user,
	});

	const { mutate: revokeOtherSessions, isPending: isRevokingOther } =
		useMutation({
			mutationFn: async () => {
				const res = await authClient.revokeOtherSessions();
				if (res.error) {
					throw new Error(res.error.message);
				}
				return res.data;
			},
			onSuccess: () => {
				toast.success("All other sessions revoked.");
				queryClient.invalidateQueries({
					queryKey: ["session", authData?.user.id],
				});
				queryClient.refetchQueries({
					queryKey: ["session", authData?.user.id],
				});
			},
			onError: error => {
				toast.error("Failed to revoke sessions");
			},
		});

	const currentSession = allSessions?.find(
		s => s.id === authData?.session.id,
	);
	const otherSessions = allSessions?.filter(
		s => s.id !== authData?.session.id,
	);

	return (
		<Card>
			<CardHeader className="border-b">
				<CardTitle className="font-normal">Sessions</CardTitle>
				<CardDescription>
					This is a list of devices that have logged into your
					account. Revoke any sessions that you do not recognize.
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-6">
				{isAllSessionsLoading && (
					<div>
						<LoaderCircle className="mx-auto animate-spin" />
					</div>
				)}
				{currentSession && (
					<SessionItem session={currentSession} isCurrentSession />
				)}
				{otherSessions && otherSessions.length > 0 && (
					<div className="space-y-4">
						<p>Other sessions</p>
						{otherSessions.map(s => (
							<SessionItem key={s.id} session={s} />
						))}
					</div>
				)}
			</CardContent>
			<CardFooter className="border-t">
				<Button
					variant="outline"
					className="ml-auto"
					disabled={!otherSessions || otherSessions.length === 0}
					onClick={() => revokeOtherSessions()}
					isLoading={isRevokingOther}>
					Sign out all other devices
				</Button>
			</CardFooter>
		</Card>
	);
}
