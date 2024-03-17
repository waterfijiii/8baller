class GameGui {
  constructor() {
    this.btn_ball = document.getElementById('btn_ball');
    this.btn_ball.onclick = () => {
      eightballgame.hitButtonClicked(Number(document.getElementById('range_strength').value));
    };

    if (debug) {
      document.getElementById('fps_stats_container').appendChild(stats.domElement);
    }
  }

  setupGameHud() {
    this.hide(document.getElementById('mainMenu'));
    this.show(document.getElementById('controlsHud'));
  }

  static addClass(el, className) {
    el.classList.add(className);
  }

  static removeClass(el, className) {
    el.classList.remove(className);
  }

  show(node) {
    GameGui.removeClass(node, 'hide');
  }

  hide(node) {
    GameGui.addClass(node, 'hide');
  }

  play8BallClicked() {
    eightballgame = new EightBallGame();
  }

  updateTimer(timerVal) {
    document.getElementsByClassName('timer')[0].textContent = timerVal;
  }

  log(str) {
    const node = document.createElement('li');
    node.textContent = str;
    document.getElementsByClassName('gamelog')[0].appendChild(node);
  }

  updateTurn(str) {
    GameGui.removeClass(document.getElementsByClassName('player1')[0], 'active');
    GameGui.addClass(document.getElementsByClassName(str)[0], 'active');
  }

  updateBalls(ballArr, p1side) {
    p1side = p1side == '?' ? 'unknown' : p1side;

    const player1 = document.getElementsByClassName('player1')[0];

    ['solid', 'striped', 'unknown'].forEach(className => {
      GameGui.removeClass(player1, className);
    });

    GameGui.addClass(player1, p1side);

    if (p1side == 'unknown') {
      return;
    }

    const createBallList = (start, end) => {
      const elem = document.createElement('ul');
      for (let i = start; i < end; i++) {
        const el = document.createElement('li');
        el.textContent = i;
        if (ballArr.indexOf(i) === -1) {
          GameGui.addClass(el, 'pocketed');
        }
        elem.appendChild(el);
      }
      return elem;
    };

    player1.replaceChild(createBallList(1, 8), player1.children[1]);
  }

  showEndGame(str) {
    document.getElementById('gameover').children[0].textContent = `${str} won!`;
    this.show(document.getElementById('gameover'));
  }
}

// Usage:
const gameGui = new GameGui();
