"use client";

import { useFilterStore } from "@/lib/store";
import { avatarUrl } from "@/lib/utils";
import { authClient } from "@budgetbee/core/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@budgetbee/ui/core/avatar";
import { Checkbox } from "@budgetbee/ui/core/checkbox";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@budgetbee/ui/core/command";
import { useQuery } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";

export function UserFilter({ id }: { id: string }) {
	const stack = useFilterStore(s => s.filter_stack);
	const toggle = useFilterStore(s => s.filter_toggle);

	const { data, isLoading } = useQuery({
		queryKey: ["organizations", "members", "filter"],
		queryFn: async () => {
			const res = await authClient.organization.listMembers();
			if (res.error) throw new Error(res.error.message);
			return res.data?.members ?? [];
		},
	});

	return (
		<Command>
			<CommandInput placeholder="Search..." />
			<CommandList>
				{isLoading && (
					<CommandGroup forceMount>
						<CommandItem disabled>
							<LoaderIcon className="mx-auto animate-spin" />
						</CommandItem>
					</CommandGroup>
				)}

				{!isLoading && (
					<CommandEmpty>No matching options.</CommandEmpty>
				)}

				<CommandGroup>
					{data?.map((member, i) => {
						const idx = stack.findIndex(x => x.id === id);
						const checked =
							idx >= 0 ?
								stack[idx].values.findIndex(
									x => x.id === member.userId,
								) >= 0
							:	false;
						return (
							<CommandItem
								key={i}
								value={member.userId}
								keywords={[
									member.user.name,
									member.user.email,
								]}
								onSelect={() =>
									toggle(
										"user",
										"is",
										{
											id: member.userId,
											label: member.user.name,
											value: member.userId,
										},
										id,
									)
								}>
								<Checkbox aria-disabled checked={checked} />
								<Avatar className="size-5">
									<AvatarImage
										src={avatarUrl(member.user.image)}
									/>
									<AvatarFallback className="text-[10px]">
										{member.user.name?.charAt(0)}
									</AvatarFallback>
								</Avatar>
								{member.user.name}
							</CommandItem>
						);
					})}
				</CommandGroup>
			</CommandList>
		</Command>
	);
}
