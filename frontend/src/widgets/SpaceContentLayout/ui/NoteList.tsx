import { useCopySong } from "@/entities/song/hooks/useCopySong";
import { NoteItem } from "./NoteItem";
import { useNavigate } from "react-router-dom";

interface NoteListProps {
  teamId: number | undefined;
}

export const NoteList = ({ teamId }: NoteListProps) => {
  const navigate = useNavigate();

  if (!teamId) {
    return <div>잘못된 팀 정보입니다.</div>;
  }

  const { data, isLoading, isError, error } = useCopySong(teamId);

  if (isLoading)
    return <div className="py-6 text-neutral500">Now Loading...</div>;

  if (isError)
    return (
      <div className="py-6 text-error font-bold">
        에러 발생!: {error.message}
      </div>
    );

  if (data && !data.success)
    return (
      <div className="py-6 text-warning font-bold">
        상정 가능한 범위의 오류 발생: {data.error?.message}
      </div>
    );

  const songData = data?.data ?? [];

  if (songData.length === 0) {
    return (
      <div className="py-6 text-neutral500">
        등록된 악보 카테고리가 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {songData.map((data) => (
        <section key={data.category_id} className="flex flex-col gap-4">
          <div className="text-left text-xl font-bold">
            {data.category_name}
          </div>
          <div className="flex flex-wrap">
            {data.copySongList.length === 0 ? (
              <div className="text-neutral500">
                카테고리에 해당하는 악보가 없습니다.
              </div>
            ) : (
              data.copySongList.map((song) => (
                <NoteItem
                  key={song.song_id}
                  song={song}
                  teamId={teamId}
                  onClick={() => navigate(`/song/${song.song_id}`)}
                />
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
};
