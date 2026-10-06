"""Detect LAN IPv4 addresses suitable for phone-to-PC backend access."""
import socket


def _is_usable_lan_ip(ip: str) -> bool:
    if not ip:
        return False
    if ip.startswith("127.") or ip.startswith("169.254."):
        return False
    if ip.startswith("0.") or ip == "255.255.255.255":
        return False
    return True


def list_lan_ips() -> list:
    """Return unique usable IPv4 addresses, UDP-route IP first."""
    seen = []
    added = set()

    def add(ip: str):
        if _is_usable_lan_ip(ip) and ip not in added:
            added.add(ip)
            seen.append(ip)

    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(1)
        s.connect(("8.8.8.8", 80))
        add(s.getsockname()[0])
        s.close()
    except Exception:
        pass

    try:
        hostname = socket.gethostname()
        for info in socket.getaddrinfo(hostname, None, socket.AF_INET, socket.SOCK_STREAM):
            add(info[4][0])
    except Exception:
        pass

    return seen


def get_local_ip() -> str:
    ips = list_lan_ips()
    return ips[0] if ips else "127.0.0.1"
