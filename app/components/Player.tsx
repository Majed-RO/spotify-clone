'use client';

import UseLoadSong from '../hooks/UseLoadSongUrl';
import useGetSongById from '../hooks/useGetSongById';
import usePlayer from '../hooks/usePlayer';
import PlayerContent from './PlayerContent';

const Player = () => {
	const player = usePlayer();
	const { song } = useGetSongById(player.activeId);

	const songUrl = UseLoadSong(song!);

	if (!song || !songUrl || !player.activeId) {
		return null;
	}

	return (
		<div className="fixed bottom-0 bg-black w-full py-2 h-[80px] px-4">
			<PlayerContent
				/* important to destroy the prev song : watch 4:20:00*/
				key={songUrl}
				song={song}
				songUrl={songUrl}
			/>
		</div>
	);
};

export default Player;
