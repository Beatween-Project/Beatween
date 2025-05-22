package com.a205.beatween.domain.drawing.service;

import com.a205.beatween.common.reponse.Result;
import com.a205.beatween.domain.drawing.dto.DrawingPoint;
import com.a205.beatween.domain.drawing.dto.DrawingUpdateMessage;
import java.util.List;
import java.util.Map;

public interface DrawingService {

    void updateDrawing(DrawingUpdateMessage message);

    List<DrawingPoint> getDrawingBySheet(String spaceId, int copySheetId);

    void saveAllDrawingsBySpaceId(String spaceId);

    Result<List<DrawingPoint>> getPersonalDrawing(int copySheetId);

    Result<Void> savePersonalDrawings(Map<Integer, List<DrawingPoint>> drawingMap);

}
