package com.a205.beatween.domain.drawing.controller;

import com.a205.beatween.common.reponse.ResponseDto;
import com.a205.beatween.common.reponse.Result;
import com.a205.beatween.domain.drawing.dto.DrawingPoint;
import com.a205.beatween.domain.drawing.service.DrawingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/drawings")
@Slf4j
public class DrawingController {

    private final DrawingService drawingService;

    @GetMapping("/practice/{copySheetId}")
    public ResponseEntity<ResponseDto<List<DrawingPoint>>> getDrawing(
            @PathVariable("copySheetId") Integer copySheetId) {

        Result<List<DrawingPoint>> result = drawingService.getPersonalDrawing(copySheetId);
        return ResponseEntity.ok(ResponseDto.from(result));
    }

    @PostMapping("/practice/save")
    public ResponseEntity<ResponseDto<Void>> saveDrawing(
            @RequestBody Map<Integer, List<DrawingPoint>> drawingMap) {

        Result<Void> result = drawingService.savePersonalDrawings(drawingMap);
        return ResponseEntity.ok(ResponseDto.from(result));
    }

    @GetMapping("/play/{copySheetId}")
    public ResponseEntity<ResponseDto<List<DrawingPoint>>> getPlayDrawing(
            @PathVariable("copySheetId") Integer copySheetId,
            @RequestParam("spaceId") String spaceId) {

        List<DrawingPoint> points = drawingService.getDrawingBySheet(spaceId, copySheetId);
        return ResponseEntity.ok(ResponseDto.from(Result.success(points)));
    }




}
