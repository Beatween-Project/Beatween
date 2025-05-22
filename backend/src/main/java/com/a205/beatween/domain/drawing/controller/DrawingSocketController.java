package com.a205.beatween.domain.drawing.controller;

import com.a205.beatween.domain.drawing.dto.DrawingPoint;
import com.a205.beatween.domain.drawing.dto.DrawingUpdateMessage;
import com.a205.beatween.domain.drawing.service.DrawingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Controller
@RequiredArgsConstructor
@Slf4j
public class DrawingSocketController {

    private final DrawingService drawingService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/updateDraw")
    public void updateDrawing(DrawingUpdateMessage message) {
        drawingService.updateDrawing(message);
        messagingTemplate.convertAndSend("/topic/draw/" + message.getCopySheetId(), message);
    }

    @MessageMapping("/getDrawing/{spaceId}/{copySheetId}")
    @SendTo("/topic/draw/init/{copySheetId}")
    public List<DrawingPoint> getDrawing(@DestinationVariable String spaceId,
                                         @DestinationVariable int copySheetId) {
        return drawingService.getDrawingBySheet(spaceId, copySheetId);
    }


}
