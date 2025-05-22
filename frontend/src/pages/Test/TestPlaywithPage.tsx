import { usePlayState } from "@/entities/play/hooks/usePlay";
import { PlayStatus } from "@/entities/play/types/Play.types";
import { toast } from "@/shared/lib/toast";
import { Button } from "@/shared/ui/Button";
import { IconButton } from "@/shared/ui/Icon";
import { Input } from "@/shared/ui/Input";
import { Client } from "@stomp/stompjs";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

export const TestPlaywithPage = () => {
  const { spaceId } = useParams<{ spaceId: string }>();

  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  const [playStatus, setPlayStatus] = useState<PlayStatus>(PlayStatus.STOPPED);
  const [currentMeasure, setCurrentMeasure] = useState(-1);
  const [positionInMeasure, setPositionInMeasure] = useState(0); // 마디 내 진행 시간 (초 또는 BPM 기준 박자 단위)
  const [bpm, setBpm] = useState("120"); //실제 적용되는 bpm
  const [inputBpm, setInputBpm] = useState(bpm); //입력중인 bpm

  const [connected, setConnected] = useState(false); //Back서버가 꺼진 등 연결이 되지 않는다면 UI 갱신도 없어야 함

  const stompClientRef = useRef<Client | null>(null);
  const clientIdRef = useRef<string>("1");

  const { data: playStateData, isSuccess } = usePlayState(spaceId);

  // 초기 재생 상태 가져오기
  useEffect(() => {
    if (isSuccess && playStateData) {
      setPlayStatus(playStateData.playStatus);
      setStartTimestamp(playStateData.startTimestamp);
      setBpm(String(playStateData.bpm));

      if (playStateData.playStatus !== PlayStatus.PLAYING) {
        //정지/중지 상태일 때 UI로 보여주는 마디를 통일시키기 위함
        // 재생 중이 아닐 때만 마디, 마디 위치 값 반영
        setCurrentMeasure(playStateData.currentMeasure);
        setPositionInMeasure(playStateData.positionInMeasure);
      }
    }
  }, [isSuccess, playStateData]);

  // socket 연결 및 구독
  useEffect(() => {
    if (!spaceId) return; //space단위로 소켓에 연결되므로

    const client = new Client({
      brokerURL: import.meta.env.VITE_BROKER_URL,
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      console.log("WebSocket connected");
      setConnected(true);

      // 에러 메시지
      client.subscribe(`/topic/errors/${clientIdRef.current}`, (msg) => {
        const error = JSON.parse(msg.body);
        toast.error({
          title: "에러 발생",
          message: `${error.error.message}`,
        });
      });

      // 재생 상태
      client.subscribe(`/topic/play/session/${spaceId}`, (msg) => {
        const message = JSON.parse(msg.body);
        if (message.sender === clientIdRef.current) return;

        setPlayStatus(message.playStatus);
        setBpm(message.bpm);

        // 서버에서 받은 현재 마디, 위치도 반영
        setCurrentMeasure(message.currentMeasure);
        setPositionInMeasure(message.positionInMeasure);

        // startTimestamp는 서버 메시지 기준으로 재조정
        if (message.startTimestamp) {
          setStartTimestamp(message.startTimestamp);
        }
      });
    };

    client.onWebSocketError = () => {
      toast.error({
        title: "서버 연결 오류",
        message: "서버 연결 중 오류가 발생했습니다. 서버 상태를 확인해주세요.",
      });
      setConnected(false);
    };

    client.onWebSocketClose = () => {
      toast.warning({
        title: "서버 연결 종료",
        message: "서버와 연결이 끊어졌습니다. 재접속을 시도합니다.",
      });
      setConnected(false);
    };

    client.onStompError = (frame) => {
      console.error("STOMP error", frame);
      toast.error({
        title: "서버 연결 오류",
        message: "서버와 연결에 문제가 발생했습니다. 재접속을 시도해주세요.",
      });
      // UI 갱신 멈추기 위해 상태 변경
      setPlayStatus(PlayStatus.STOPPED);
    };

    client.onDisconnect = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      setConnected(false);
    };
  }, [spaceId]);

  // 마디 갱신
  useEffect(() => {
    if (
      playStatus !== PlayStatus.PLAYING ||
      !startTimestamp ||
      Number(bpm) <= 0 ||
      !connected
    )
      return;

    const beatDurationMs = 60000 / Number(bpm);
    const measureDurationMs = beatDurationMs * 4;

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTimestamp;
      const newMeasure = Math.floor(elapsed / measureDurationMs);
      const newPosition = (elapsed % measureDurationMs) / beatDurationMs;

      setCurrentMeasure(newMeasure);
      setPositionInMeasure(newPosition);
    }, 100); // UI 갱신

    return () => clearInterval(intervalId);
  }, [playStatus, bpm, startTimestamp, connected]);

  // 재생, 정지시마다 현재 재생 상태를 서버로 보내는 동작
  // (redis에 저장하고, broadcast 진행)
  const sendPlayState = (
    playStatus: PlayStatus,
    measure = currentMeasure,
    position = positionInMeasure,
    currentBpm = bpm,
    timestamp = startTimestamp
  ) => {
    if (!stompClientRef.current || !stompClientRef.current.connected) return;

    console.log(playStatus);

    const message = {
      spaceId: spaceId,
      bpm: currentBpm,
      startTimestamp: timestamp,
      playStatus: playStatus,
      currentMeasure: measure,
      positionInMeasure: position,
      sender: clientIdRef.current, //userId
    };

    stompClientRef.current.publish({
      destination: "/app/play/update",
      body: JSON.stringify(message),
    });
  };

  const applyBpm = () => {
    const newBpm = Number(inputBpm);
    if (newBpm <= 0 || !startTimestamp || playStatus !== PlayStatus.PLAYING) {
      setBpm(inputBpm);
      return;
    }

    // 현재까지 경과 시간 (이전 bpm 기준)
    const prevBeatDurationMs = 60000 / Number(bpm);
    const prevMeasureDurationMs = prevBeatDurationMs * 4;

    const elapsed = Date.now() - startTimestamp;
    const measure = Math.floor(elapsed / prevMeasureDurationMs);
    const position = (elapsed % prevMeasureDurationMs) / prevBeatDurationMs;

    // 새로운 bpm 기준 마디 길이
    const newBeatDurationMs = 60000 / newBpm;
    const newMeasureDurationMs = newBeatDurationMs * 4;

    // 새로운 startTimestamp 계산
    const newStartTimestamp =
      Date.now() -
      (measure * newMeasureDurationMs + position * newBeatDurationMs);

    // 적용
    setBpm(String(newBpm));
    setStartTimestamp(newStartTimestamp);

    // 서버에 반영
    sendPlayState(
      PlayStatus.PLAYING,
      measure,
      position,
      String(newBpm),
      newStartTimestamp
    );
  };

  const handlePlayClick = () => {
    if (playStatus === PlayStatus.PAUSED) {
      // 일시정지 상태에서 재생: 현재 마디와 위치를 기준으로 startTimestamp 재계산
      const beatDurationMs = 60000 / Number(bpm);
      const measureDurationMs = beatDurationMs * 4;
      const newStartTimestamp =
        Date.now() -
        (currentMeasure * measureDurationMs +
          positionInMeasure * beatDurationMs);

      setStartTimestamp(newStartTimestamp);
      setPlayStatus(PlayStatus.PLAYING);
      sendPlayState(
        PlayStatus.PLAYING,
        currentMeasure,
        positionInMeasure,
        bpm,
        newStartTimestamp
      );
    } else {
      // 중지 상태에서 재생
      const now = Date.now();
      setCurrentMeasure(0);
      setPositionInMeasure(0);
      setStartTimestamp(now);
      setPlayStatus(PlayStatus.PLAYING);
      sendPlayState(PlayStatus.PLAYING, 0, 0, bpm, now);
    }
  };

  const handlePauseClick = () => {
    setPlayStatus(PlayStatus.PAUSED);
    sendPlayState(
      PlayStatus.PAUSED,
      currentMeasure,
      positionInMeasure,
      bpm,
      startTimestamp
    );
  };

  const handleStopClick = () => {
    setPlayStatus(PlayStatus.STOPPED);
    setCurrentMeasure(0);
    setPositionInMeasure(0);
    setStartTimestamp(null);
    sendPlayState(PlayStatus.STOPPED, 0, 0, bpm, null);
  };

  return (
    <>
      <h1>합주방 테스트 페이지</h1>
      <p>재생 상태: {playStatus}</p>
      <p>현재 마디: {currentMeasure}</p>
      <p className="flex justify-center gap-3">
        <IconButton
          onClick={handlePlayClick}
          icon="play_arrow"
          size={36}
          fill
        />
        <IconButton
          onClick={handlePauseClick}
          icon="pause"
          size={36}
          fill
          disabled={!connected || playStatus !== PlayStatus.PLAYING}
        />
        <IconButton
          onClick={handleStopClick}
          icon="stop"
          size={36}
          fill
          disabled={!connected}
        />
      </p>
      <p>
        <Input
          type="number"
          value={inputBpm}
          onChange={(val) => {
            if (/^\d*$/.test(val)) {
              setInputBpm(val);
            }
          }}
          placeholder="BPM 입력"
          maxLength={3}
          showCount={true}
          className="w-24"
        />
        <Button icon="save" fill onClick={applyBpm}>
          BPM 반영
        </Button>
      </p>
    </>
  );
};
