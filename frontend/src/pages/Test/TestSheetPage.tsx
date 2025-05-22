import { useCopySheet } from "@/entities/song/hooks/useCopySheet";

export const TestSheetPage = () => {
  const { data, isLoading, isError, error } = useCopySheet(1, 1, 1, 1);

  if (isLoading) return <div>Now Loading...</div>;
  if (isError)
    return (
      <div className="text-error font-bold">에러 발생!: {error.message}</div>
    );

  // Back에서 서버의 잘못이 아닌, 충분히 발생할 수 있는 응답 실패는
  // 200 동작으로 처리하여 error 객체 자체를 보내주도록 컨벤션을 지정했습니다
  // 이에 프론트에서는 data의 success 부분이 false일 경우를 처리하는 분기가 필요합니다
  if (data && !data.success)
    return <div>상정 가능한 범위의 오류 발생: {data.error?.message}</div>;

  return (
    <div className="flex flex-col m-8 p-4 gap-2">
      <h1 className="font-bold text-2xl">개별 악보 조회 테스트 페이지</h1>
      <div>악보 파트: {data?.data.part}</div>
      <div>시트 주소: {data?.data.sheetUrl}</div>
      <div>들어오는 데이터 그 자체: {JSON.stringify(data)}</div>
    </div>
  );
};
