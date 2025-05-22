package com.a205.beatween.common.util;

import java.util.regex.*;

public class YoutubeUtil {
    // 다양한 유튜브 URL 패턴을 지원하는 정규식
    private static final String YOUTUBE_REGEX =
            "(?:youtube(?:-nocookie)?\\.com/(?:[^/\\n\\s]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\\.be/)([\\w-]{11})";

    public static String extractYoutubeId(String url) {
        Pattern pattern = Pattern.compile(YOUTUBE_REGEX, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(url);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }
}

