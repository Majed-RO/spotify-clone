import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

import { getUrl } from '@/app/libs/helpers';
import { stripe } from '@/app/libs/stripe';
import { createOrRetrieveCustomer } from '@/app/libs/supabaseAdmin';

export async function POST(request: Request) {
	const { price, quantity = 1, metadata = {} } = await request.json();

	try {
		const supabase = createRouteHandlerClient({
			cookies
		});

		const {
			data: { user }
		} = await supabase.auth.getUser();

		const customer = await createOrRetrieveCustomer({
			uuid: user?.id || '',
			email: user?.email || ''
		});

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			billing_address_collection: 'required',
			customer,
			line_items: [
				{
					price: price.id,
					quantity
				}
			],
			mode: 'subscription',
			allow_promotion_codes: true,
			subscription_data: {
				trial_from_plan: true,
				metadata
			},
			success_url: `${getUrl()}/account`,
			cancel_url: `${getUrl()}`
		});

		return NextResponse.json({ sessionId: session.id });
	} catch (error) {
		console.log(error);
		return new NextResponse('Internal Error', { status: 500 });
	}
}
