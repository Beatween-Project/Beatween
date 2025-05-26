package com.a205.beatween.domain.play.service;

import com.a205.beatween.common.reponse.Result;
import com.a205.beatween.domain.play.dto.message.PlayControlMessage;
import com.a205.beatween.domain.play.dto.response.CategoryWithSongsResponse;
import com.a205.beatween.domain.play.dto.response.SelectedSongResponse;
import com.a205.beatween.domain.play.dto.response.SheetWithDrawingResponse;

import java.util.List;

public interface PlayService {
    void savePlaySession(PlayControlMessage message);

    PlayControlMessage getLatestState(Integer spaceId);

    boolean isManager(String spaceId, String sessionId);

    void sendInitialManagerStatus(String userId, String spaceId, boolean isManager);

    void broadcastManagerChange(String spaceId, String newManagerSessionId);

    void handleManualDisconnect(String spaceId, String sessionId, String userId);

    Result<List<CategoryWithSongsResponse>> getAllSheets(Integer spaceId);

    Result<Void> selectSong(Integer spaceId, Integer copySongId, Integer userId);

    Result<SelectedSongResponse> getSelectedSong(Integer spaceId);

    Result<SheetWithDrawingResponse> getSheetWithDrawing(String spaceId, Integer copySheetId);


}
