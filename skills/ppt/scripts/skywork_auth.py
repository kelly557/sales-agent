import os
from typing import Optional


def get_skywork_api_key() -> Optional[str]:
    """
    Returns skywork api key.

    The doctech app passes SKYWORK_API_KEY through the local Vite bridge when
    invoking run_ppt_write.py. web_search remains disabled separately.
    """
    api_key = os.environ.get("SKYWORK_API_KEY", "")
    if not api_key:
        print("SKYWORK_API_KEY is not set.")
        return None
    return api_key
