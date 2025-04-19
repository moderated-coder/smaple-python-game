# app.py
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    """메인 게임 페이지를 렌더링합니다."""
    return render_template('index.html')

if __name__ == '__main__':
    # 개발 중에는 debug=True로 설정하면 코드 변경 시 서버가 자동 재시작됩니다.
    app.run(debug=True)