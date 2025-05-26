import os
import subprocess

def separate_audio_with_demucs(wav_path: str, storage_path: str) -> dict:
    try:
        demucs_out = os.path.join(storage_path, "demucs")
        os.makedirs(demucs_out, exist_ok=True)
        
        subprocess.run(
            f"demucs -o {demucs_out} {wav_path}",
            shell=True,
            check=True,
            capture_output=True,
            text=True
        )
        
        base_name = os.path.splitext(os.path.basename(wav_path))[0]
        stems = {
            "drums": os.path.join(demucs_out, "htdemucs", base_name, "drums.wav"),
            "bass": os.path.join(demucs_out, "htdemucs", base_name, "bass.wav"),
            "vocals": os.path.join(demucs_out, "htdemucs", base_name, "vocals.wav"),
            "other": os.path.join(demucs_out, "htdemucs", base_name, "other.wav")
        }
        
        for stem_type, path in stems.items():
            if not os.path.exists(path):
                raise FileNotFoundError(f"Demucs {stem_type}.wav not found")
                
        return stems
    
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Demucs failed: {e.stderr}")
    except Exception as e:
        raise RuntimeError(f"Audio separation error: {str(e)}")
