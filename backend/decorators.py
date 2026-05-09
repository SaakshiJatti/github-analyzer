import time
import functools

# ── @timer ────────────────────────────────────────────────────────────────────
def timer(func):
    """Prints how long a function took to run."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"[timer] {func.__name__} took {end - start:.2f}s")
        return result
    return wrapper


# ── @log_call ─────────────────────────────────────────────────────────────────
def log_call(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # Skip 'self' argument for cleaner logs
        display_args = args[1:] if args and hasattr(args[0], '__dict__') else args
        args_repr = [repr(a) for a in display_args]
        kwargs_repr = [f"{k}={v!r}" for k, v in kwargs.items()]
        all_args = ", ".join(args_repr + kwargs_repr)
        print(f"[log] Calling {func.__name__}({all_args})")
        return func(*args, **kwargs)
    return wrapper


# ── @retry ────────────────────────────────────────────────────────────────────
def retry(max_attempts=3, delay=2):
    """
    Retries a function up to max_attempts times if it raises an exception.
    Uses a closure — 'max_attempts' and 'delay' are captured from outer scope.
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    print(f"[retry] {func.__name__} failed (attempt {attempt}/{max_attempts}): {e}")
                    if attempt < max_attempts:
                        time.sleep(delay)
            raise last_exception  # re-raise after all attempts exhausted
        return wrapper
    return decorator

if __name__ == "__main__":
    @timer
    @log_call
    def greet(name):
        time.sleep(0.5)
        return f"Hello {name}"

    print(greet("GitHub"))

    @retry(max_attempts=3, delay=1)
    def flaky():
        import random
        if random.random() < 0.7:
            raise ConnectionError("Network blip!")
        return "Success!"

    try:
        print(flaky())
    except Exception as e:
        print(f"All retries failed: {e}")