import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

/* 
https://react.dev/reference/react/forwardRef#forwarding-a-ref-through-multiple-components
1- forwardRef lets your component expose a DOM node to parent component with a ref.
2- Call forwardRef() to let your component receive a ref and forward it to a child component
3- Keep in mind that exposing a ref to the DOM node inside your component makes it harder to change your component’s internals later. You will typically expose DOM nodes from reusable low-level components like buttons or text inputs, but you won’t do it for application-level components like an avatar or a comment.


*/

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, children, disabled, type = 'button', ...props }, ref) => {
		return (
			<button
				type={type}
				className={twMerge(
					`
       w-full rounded-full bg-green-500 border border-transparent p-3 disabled:cursor-not-allowed disabled:opacity-50 text-black font-bold hover:opacity-75 transition
       `,
					className
				)}
				disabled={disabled}
				ref={ref}
				{...props}
			>
				{children}
			</button>
		);
	}
);

Button.displayName = 'Button';

export default Button;
