from flask import Flask, render_template, request
import yaml, pathlib

BASE = pathlib.Path(__file__).parent

def yml(name):
    """YAML loader: returns an empty list when file is missing or empty."""
    path = BASE / 'data' / name
    if not path.exists():
        return []
    return yaml.safe_load(path.read_text()) or []

app = Flask(__name__,
            static_folder="static",
            template_folder="templates")

# ───── Routes ───────────────────────────────────────────

@app.route("/")
def index():
    lang = request.args.get("lang", "ja")
    # data/index.yaml から動画情報を読み込む
    index_data = yml("index.yaml") or {}
    video_src  = index_data.get("video_src")
    video_desc = index_data.get("video_desc")

    return render_template(
        "index.html",
        lang=lang,
        video_src=video_src,
        video_desc=video_desc
    )

@app.route("/members/")
def members():
    lang = request.args.get("lang", "ja")
    members = yml("members.yaml")  # ← ここでmembersデータをロード
    return render_template("members.html", members=members, lang=lang)  # ← ここでmembersを渡す

@app.route("/projects/")
def projects():
    lang = request.args.get("lang", "ja")
    projects = yml("projects.yaml")
    return render_template("projects.html", projects=projects, lang=lang)

@app.route("/links/")
def links():
    lang = request.args.get("lang", "ja")
    return render_template("links.html", lang=lang)

@app.route("/contact/")
def contact():
    lang = request.args.get("lang", "ja")
    return render_template("contact.html", lang=lang)