export function getEasternSportsDate(): string {
    // Get current time in Eastern Time
    const nowET = new Date(
        new Date().toLocaleString("en-US", {
            timeZone: "America/New_York",
        })
    );

    // If before 4 AM ET, subtract one day
    if (nowET.getHours() < 4) {
        nowET.setDate(nowET.getDate() - 1);
    }

    // Format as YYYY-MM-DD
    return nowET.toLocaleDateString("en-CA");
}
