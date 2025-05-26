from pydantic import BaseModel, Field
from typing import Optional

class CreateSheetResponse(BaseModel):
    title: Optional[str] = None
    youtube_url: Optional[str] = Field(None, alias="youtube_url")
    thumbnail_url: Optional[str] = Field(None, alias="thumbnail_url")
    bpm: Optional[int] = None
    total_measures: Optional[int] = Field(None, alias="total_measures")
    vocal_url: Optional[str] = Field(None, alias="vocal_url")
    guitar_url: Optional[str] = Field(None, alias="guitar_url")
    bass_url: Optional[str] = Field(None, alias="bass_url")
    drum_url: Optional[str] = Field(None, alias="drum_url")

    class Config:
        allow_population_by_field_name = True