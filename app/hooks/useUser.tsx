import { createContext, useContext, useEffect, useState } from 'react';
import { Subscription, UserDetails } from '@/types/types';

import { User } from '@supabase/auth-helpers-nextjs';
import {
	useSessionContext,
	useUser as useSupabaseUser
} from '@supabase/auth-helpers-react';

type userContextType = {
	accessToken: string | null;
	user: User | null;
	userDetails: UserDetails | null;
	isLoading: boolean;
	subscription: Subscription | null;
};

export const UserContext = createContext<userContextType | undefined>(
	undefined
);

export interface Props {
	// general prop
	[propName: string]: any;
}

export const MyUserContextProvider = (props: Props) => {
	// here we can use useSessionContext bcz we used <SupabaseProvider> in layout which used SessionContextProvider  from '@supabase/auth-helpers-react';
	const {
		session,
		isLoading: isLoadingUser,
		supabaseClient: supabase
	} = useSessionContext();

	// also here we used useUser as useSupabaseUser from '@supabase/auth-helpers-react';
	const user = useSupabaseUser();

	// console.log('TEST supabaseClient', typeof supabase, supabase);

	const accessToken = session?.access_token ?? null;

	const [isLoadingData, setIsLoadingData] = useState(false);
	const [userDetails, setUserDetails] = useState<UserDetails | null>(
		null
	);
	const [subscription, setSubscription] = useState<Subscription | null>(
		null
	);

	// how it knows the current user to fetch ??!!
	// My conclusion: the supabase object is related to the current session, and it contains the required info of the current user
	// then the function getUserDetails: get the details of the user who is stored in the session
	// it should send the user id with the query
	const getUserDetails = () =>
		supabase.from('users').select('*').single();

	// TODO test this function when a user is logged in
	// console.log('getUserDetails', getUserDetails());

	const getSubscription = () =>
		supabase
			.from('subscriptions')
			.select('*, prices(*, products(*))')
			.in('status', ['trialing', 'active'])
			.single();

	useEffect(() => {
		if (user && !isLoadingData && !userDetails && !subscription) {
			setIsLoadingData(true);

			Promise.allSettled([
				getUserDetails(),
				getSubscription()
			]).then(results => {
				const userDetailsPromise = results[0];
				const subscriptionPromise = results[1];

				if (userDetailsPromise.status === 'fulfilled') {
					setUserDetails(
						userDetailsPromise.value
							.data as UserDetails
					);
				
				}

				if (
					subscriptionPromise.status ===
					'fulfilled'
				) {
					setSubscription(
						subscriptionPromise.value
							.data as Subscription
					);
				}

				setIsLoadingData(false);
			});
		} else if (!user && !isLoadingData) {
			setUserDetails(null);
			setSubscription(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, isLoadingUser]);

	const value = {
		accessToken,
		user,
		userDetails,
		isLoading: isLoadingData || isLoadingUser,
		subscription
	};

	return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
	const context = useContext(UserContext);

	if (context === undefined) {
		throw new Error(
			'useUser must be used within a MyUserContextProvider'
		);
	}

	// returns the full details of the user with his/her subscription:
	// 	accessToken, user, userDetails, isLoading, subscription
	return context;
};
