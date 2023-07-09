from datetime import datetime
import pytz

# Get current time in UTC
now_utc = datetime.now(pytz.timezone('UTC'))

# Convert to Eastern Time
now_est = now_utc.astimezone(pytz.timezone('US/Eastern'))

# Format the datetime object for display in a 12-hour format
formatted_est = now_est.strftime('%Y-%m-%d %I:%M:%S %p %Z')

print(formatted_est)
