'use client';

import Button from '@/app/components/Button';
import useSubscribeModal from '@/app/hooks/useSubscribeModal';
import { useUser } from '@/app/hooks/useUser';
import { postData } from '@/app/libs/helpers';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const AccountContent = () => {
	const router = useRouter();
	const subscribeModal = useSubscribeModal();

	const { user, subscription, isLoading } = useUser();

	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!isLoading && !user) {
			router.replace('/');
		}
	}, [isLoading, user, router]);

	const redirectToCustomerPortal = async () => {
		setLoading(true);

		try {
			const { url, error } = await postData({
				url: '/api/create-portal-link'
			});
			window.location.assign(url);
		} catch (error) {
			toast.error((error as Error)?.message);
		}
		setLoading(false);
	};

	return (
		<div
			className="
  mb-7 px-6
  "
		>
			{!subscription && (
				<div className="flex flex-col gap-y-4">
					<p>No Active plan.</p>
					<Button
						className="w-[300px]"
						onClick={subscribeModal.onOpen}
					>
						Subscribe
					</Button>
				</div>
			)}

      {subscription && (
        <div className='flex flex-col gap-y-4'>
          <p>
            You are currently on the <b>{subscription.prices?.products?.name}</b> plan.
          </p>
          <Button
          className='w-[300px]'
          disabled={loading || isLoading}
          onClick={redirectToCustomerPortal}
          >
            Open Customer Portal
          </Button>
        </div>
      )}
		</div>
	);
};

export default AccountContent;
