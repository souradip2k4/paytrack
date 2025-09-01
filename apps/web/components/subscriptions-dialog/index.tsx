import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";

export function SubscriptionsDialog() {
	const {
		reset,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(subscriptionFormSchema),
	});

	return (
		<Dialog>
			<DialogTrigger>Subscriptions</DialogTrigger>
			<DialogContent></DialogContent>
		</Dialog>
	);
}
