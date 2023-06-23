import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import { NextResponse } from 'next/server';

import { getUrl } from '@/app/libs/helpers';
import { stripe } from '@/app/libs/stripe';
import { createOrRetrieveCustomer } from '@/app/libs/supabaseAdmin';

export async function POST() {
	try {
		const supabase = createRouteHandlerClient({
			cookies
		});

		const {
			data: { user }
		} = await supabase.auth.getUser();

		if (!user) throw new Error('Could not get user!');

		const customer = await createOrRetrieveCustomer({
			uuid: user?.id || '',
			email: user?.email || ''
		});

		if (!customer) throw new Error('Could not get customer!');

		const { url } = await stripe.billingPortal.sessions.create({
			customer,
			return_url: `${getUrl()}/account`
		});

		return NextResponse.json({ url });
	} catch (error) {
		console.log(error);
		return new NextResponse('Internal Error', { status: 500 });
	}
}
