'use client';

import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import uniqid from 'uniqid';
import { toast } from 'react-hot-toast';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

import useUploadModal from '../hooks/useUploadModal';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { useUser } from '../hooks/useUser';
import { useRouter } from 'next/navigation';

const UploadModal = () => {
	const [isLoading, setIsLoading] = useState(false);

	const uploadModal = useUploadModal();
	const { user } = useUser();

	const supabaseClient = useSupabaseClient();
	const router = useRouter();

	const { register, handleSubmit, reset } = useForm<FieldValues>({
		defaultValues: {
			author: '',
			title: '',
			song: null,
			image: null
		}
	});

	const onSubmit: SubmitHandler<FieldValues> = async values => {
		// Upload to supabase

		try {
			setIsLoading(true);

			const songFile = values.song?.[0];
			const imageFile = values.image?.[0];

			if (!songFile || !imageFile || !user) {
				toast.error('Missing fields');
				return;
			}

			// this unique id is to store safely in supabase bucket
			const uniqueID = uniqid();

			//upload song
			const { data: songData, error: SongError } =
				await supabaseClient.storage
					.from('songs')
					.upload(
						`song-${values.title}-${uniqueID}`,
						songFile,
						{
							cacheControl: '3600',
							upsert: false
						}
					);

			if (SongError) {
				setIsLoading(false);
				return toast.error('Failed song upload.');
			}

			//upload image
			const { data: imageData, error: imageError } =
				await supabaseClient.storage
					.from('images')
					.upload(
						`image-${values.title}-${uniqueID}`,
						imageFile,
						{
							cacheControl: '3600',
							upsert: false
						}
					);

			if (imageError) {
				setIsLoading(false);
				return toast.error('Failed image upload.');
			}

			const { error: supabaseError } = await supabaseClient
				.from('songs')
				.insert({
					user_id: user.id,
					title: values.title,
					author: values.author,
					image_path: imageData.path,
					song_path: songData.path
				});

			if (supabaseError) {
				setIsLoading(false);
				return toast.error(supabaseError.message);
			}

			router.refresh();
			setIsLoading(false);
			toast.success('Song created');
			reset();
			uploadModal.onClose();
		} catch (error) {
			toast.error('Something went wrong!');
		} finally {
			setIsLoading(false);
		}
	};

	const onChange = (open: boolean) => {
		// when click on close btn, it will return open as false
		if (!open) {
			// when closing the modal, the form will reset
			reset();
			uploadModal.onClose();
		}
	};

	return (
		<Modal
			title="Add a song"
			description="Upload an mp3 file"
			onChange={onChange}
			isOpen={uploadModal.isOpen}
		>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex flex-col gap-y-4"
			>
				<Input
					id="title"
					disabled={isLoading}
					{...register('title', {
						required: true
					})}
					placeholder="Song Title"
				/>
				<Input
					id="author"
					disabled={isLoading}
					{...register('author', {
						required: true
					})}
					placeholder="Song author"
				/>

				<div>
					<div className="pb-1">
						Select a song file
					</div>
					<Input
						id="song"
						type="file"
						disabled={isLoading}
						accept=".mp3"
						{...register('song', {
							required: true
						})}
					/>
				</div>

				<div>
					<div className="pb-1">
						Select an image
					</div>
					<Input
						id="image"
						type="file"
						disabled={isLoading}
						accept="image/*"
						{...register('image', {
							required: true
						})}
					/>
				</div>

				<Button disabled={isLoading} type="submit">
					Create
				</Button>
			</form>
		</Modal>
	);
};

export default UploadModal;
