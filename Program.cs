// Minimal local host for the game: run the project (F5) to play in the browser.
var app = WebApplication.CreateBuilder(args).Build();

var gameFile = Path.Combine(AppContext.BaseDirectory, "neon-survivors.html");

app.MapGet("/", () => Results.File(gameFile, "text/html"));
app.MapGet("/neon-survivors.html", () => Results.File(gameFile, "text/html"));

app.Run();
