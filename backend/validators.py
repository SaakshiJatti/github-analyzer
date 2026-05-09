import re

def validate_username(username: str) -> bool:
    """
    GitHub usernames:
    - 1 to 39 characters
    - Only alphanumeric and hyphens
    - Cannot start or end with a hyphen
    """
    pattern = r'^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?!-)){0,37}[a-zA-Z0-9]$|^[a-zA-Z0-9]$'
    
    if not username:
        raise ValueError("Username cannot be empty.")
    
    if not re.match(pattern, username):
        raise ValueError(
            f"'{username}' is not a valid GitHub username. "
            "Use only letters, numbers, and hyphens. "
            "Cannot start or end with a hyphen. Max 39 characters."
        )
    
    return True

