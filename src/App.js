import React from 'react';

export default class App extends React.Component {
  constructor() {
    super();
    let gameboard = {
      x: 20,
      y: 7,
      dungeon: 1,
      map: [],
      elements: {
        health: {
          qty: 3,
          amt: 20
        },
        mobs: {
          qty: 3,
          hp: 10,
          xp: 2
        },
        boss: {
          qty: 1,
          hp: 30,
          lvl: 5
        }
      }

    };

    let player = {
      pos: {
        x: Math.floor(Math.random() * gameboard.x) + 1,
        y: Math.floor(Math.random() * gameboard.y) + 1
      },
      stats: {
        lvl: 1,
        xp: 0,
        hp: 100,
        weapon: 0
      }
    }

    let weapons = [
      {
      'name': 'Fists',
      'damage': 1
    }, {
      'name': 'Dagger',
      'damage': 2
    }, {
      'name': 'Mace',
      'damage': 3
    }, {
      'name': 'Sword',
      'damage': 4
    }, {
      'name': 'Dragon\'s Jaw',
      'damage': 5
    }];

    this.state = {
      gameboard,
      player,
      weapons
    };

  }

  reset() {
    window.location.href = 'https://s.codepen.io/bwobst/debug/yJmXro';
  }

  ranTile(axis) {
    let gameboard = {
      x: 20,
      y: 6
    };
    return Math.floor(Math.random() * gameboard[axis]);
  }

  updateState(prop) {
    this.setState(prop);
  }

  render() {
    return (
      <div className="container">
        <div className="row header">
          <h1 className="text-center">Rougelike</h1>
          <span><kbd>P</kbd> Player</span>
          <span><kbd>H</kbd> Health</span>
          <span><kbd>W</kbd> Weapon</span>
          <span><kbd>M</kbd> Monster</span>
          <span><kbd>B</kbd> Boss</span>
          <span><kbd>O</kbd> Portal</span>
        </div>
        <div className="row">
          <PlayerStats
            dungeon={this.state.gameboard.dungeon}
            player={this.state.player}
            weapons={this.state.weapons}
          />
          <GameBoard
            gameboard={this.state.gameboard}
            player={this.state.player}
            updateState={this.updateState.bind(this)}
            ranTile={this.ranTile}
            reset={this.reset}
          />
        </div>
      </div>

    )
  }

}

class PlayerStats extends React.Component {
  render() {
    let playerStats = this.props.player.stats;
    // let playerPos = this.props.player.pos;

    return (
      <div className="stats">
        <p>Dungeon: {this.props.dungeon}</p>
        <br />
        <p><i className="fa fa-heart" /> {playerStats.hp}</p>
        <p>LVL: {playerStats.lvl}</p>
        <p>XP: {playerStats.xp}</p>
        <br />
        <p>Weapon: {this.props.weapons[playerStats.weapon].name}</p>
        <p>Damage: {this.props.weapons[playerStats.weapon].damage}</p>
        {/* <p>Player Coords: X:{playerPos.x}, Y:{playerPos.y}</p> */}
      </div>
    );
  }
}

class GameBoard extends React.Component {

  componentDidMount() {
    this.initMap();
    document.body.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  initMap() {
    let $this = this;
    let gameboard = this.props.gameboard;
    let map = [];
    let takenCoords = [];

    // Generate map
    for (var y = 0; y < gameboard.y; y++) {
      var newRow = [];
      for (var x = 0; x < gameboard.x; x++) {
        (Math.random() > 0.8) ? newRow.push('#') : newRow.push('.');
      }
      map.push(newRow);
    }

    // Place player
    let playerPos = this.props.player.pos;
    let playerPosX = playerPos.x;
    let playerPosY = playerPos.y;
    map[playerPosY - 1][playerPosX - 1] = 'P';

    let tempTakenCoords = [playerPos.x - 1, playerPos.y - 1].toString();
    takenCoords.push(tempTakenCoords);

    function checkIfSomethingIsAlreadyAtThoseCoords(x, y) {
      let proposedCoord = [x, y].toString();
      let res = false;

      takenCoords.forEach(function(el) {
        if (el === proposedCoord) {
          res = true;
        }
      });

      return res;
    }

    function placeItemsWithMultipleQuantities(name, icon) {
      for (let i = 0; i < $this.props.gameboard.elements[name].qty; i++) {

        let proposedX = $this.props.ranTile('x');
        let proposedY = $this.props.ranTile('y');
        let somethingIsAlreadyAtThoseCoords = checkIfSomethingIsAlreadyAtThoseCoords(proposedX, proposedY);

        function generateRandomCoords() {
        proposedX = $this.props.ranTile('x');
        proposedY = $this.props.ranTile('y');

        somethingIsAlreadyAtThoseCoords = checkIfSomethingIsAlreadyAtThoseCoords(proposedX, proposedY);
        }

        if (somethingIsAlreadyAtThoseCoords) {
          generateRandomCoords();
        } else {
          let tempTakenCoords = [proposedX, proposedY].toString();
          takenCoords.push(tempTakenCoords);

          map[proposedY][proposedX] = icon;
        }
      }
    }

    function placeItemWithOneQuantity(icon) {
        let proposedX = $this.props.ranTile('y');
        let proposedY = $this.props.ranTile('x');

        let somethingIsAlreadyAtThoseCoords = checkIfSomethingIsAlreadyAtThoseCoords(proposedX, proposedY);

        if (somethingIsAlreadyAtThoseCoords) {
          proposedX = $this.props.ranTile('y');
          proposedY = $this.props.ranTile('x');
          somethingIsAlreadyAtThoseCoords = checkIfSomethingIsAlreadyAtThoseCoords(proposedX, proposedY);
          placeItemWithOneQuantity(icon);
        } else {
          let ranTileX = $this.props.ranTile('x');
          let ranTileY = $this.props.ranTile('y');

          let tempTakenCoords = [ranTileX, ranTileY].toString();
          takenCoords.push(tempTakenCoords);

          map[ranTileY][ranTileX] = icon;
        }
    }

    // Place health
    placeItemsWithMultipleQuantities('health', 'H');

    // Place monsters
    placeItemsWithMultipleQuantities('mobs', 'M');

    // Place boss
    if (gameboard.dungeon + 1 === 5) {
      placeItemWithOneQuantity('B');
    }

    // Place portal and weapon
    if (gameboard.dungeon + 1 <= 4) {
      placeItemWithOneQuantity('O');
      placeItemWithOneQuantity('W');
    }

    gameboard.map = map;

    this.props.updateState({
      gameboard: gameboard
    });
  }

  drawMap() {
    let map = this.props.gameboard.map;

    return map.map(function(row) {
      return (
        <div>{row}</div>
      );
    })
  }

  handleKeyDown(evt) {
    let $this = this;
    let gameboard = this.props.gameboard;
    let map = this.props.gameboard.map;
    let player = this.props.player;

    // Make player's previous position a '.'
    map[player.pos.y - 1][player.pos.x - 1] = '.';

    function _getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function handlePlayerMove(delta) {
      let newPos = map[player.pos.y + delta.y][player.pos.x + delta.x];

      if (newPos === '#') { return false }

      switch (newPos) {
        case '.':
          player.pos[delta.update] += delta[delta.update] + 1;
          break;
        case 'H':
          player.stats.hp += gameboard.elements.health.amt;
          player.pos[delta.update] += delta[delta.update] + 1;
          break;
        case 'W':
          player.stats.weapon += 1;
          player.pos[delta.update] += delta[delta.update] + 1;
          break;
        case 'O':
          if (gameboard.dungeon < 5) {
            $this.initMap();
            gameboard.dungeon += 1;
          }
          break;
        case 'M':
          let playerHitsFor = _getRandomInt(1, 10) + player.stats.weapon + player.stats.lvl;
          let monsterHitsFor = _getRandomInt(10, 20) + gameboard.dungeon;

          // let playerHPBeforeHit = player.stats.hp;
          // let monsterHPBeforeHit = gameboard.elements.mobs.hp + gameboard.dungeon;

          gameboard.elements.mobs.hp -= playerHitsFor;
          player.stats.hp -= monsterHitsFor;

          if (gameboard.elements.mobs.hp <= 0) {
            player.pos[delta.update] += delta[delta.update] + 1;
            gameboard.elements.mobs.hp = 10 + gameboard.dungeon;
            player.stats.xp += $this.props.gameboard.elements.mobs.xp;
          }

          if (player.stats.hp <= 0) {
            alert('the monster got you!');
            $this.props.reset();
          }

          break;
        case 'B':
          // let bossHPBeforeHit = gameboard.elements.boss.hp;
          // var playerHPBeforeHit = player.stats.hp;
          // var playerHitsFor = _getRandomInt(1, 10) + player.stats.weapon + player.stats.lvl;
          let bossHitsFor = _getRandomInt(20, 30);

          gameboard.elements.boss.hp -= playerHitsFor;
          player.stats.hp -= bossHitsFor;

          if (gameboard.elements.boss.hp <= 0 && player.stats.hp <= 0) {
            alert('You kill each other.  Shakespearean ending!');
            $this.props.reset();
          } else if (gameboard.elements.boss.hp <= 0) {
            player.pos[delta.update] += delta[delta.update] + 1;
            alert('you beat the boss!');
            $this.props.reset();
          } else if (player.stats.hp <= 0) {
            alert('the boss got you!');
            $this.props.reset();
          }
          break;
        default:
          console.log('how did you get here...?');
      }
    }

    // go <direction>, but make sure it wouldn't be out of bounds
    if (evt.which === 37 && player.pos.x - 1 > 0) {
        let delta = {y: -1, x: -2, update: 'x'};
        handlePlayerMove(delta);
    } else if (evt.which === 38 && player.pos.y - 1 > 0) {
        let delta = {y: -2, x: -1, update: 'y'};
        handlePlayerMove(delta);
    } else if (evt.which === 39 && player.pos.x < this.props.gameboard.x) {
        let delta = {y: -1, x: 0, update: 'x'};
        handlePlayerMove(delta);
    } else if (evt.which === 40 && player.pos.y < this.props.gameboard.y) {
        let delta = {y: 0, x: -1, update: 'y'};
        handlePlayerMove(delta);
    }

    // Move player
    map[player.pos.y - 1][player.pos.x - 1] = 'P';

    // Update player level
    player.stats.level = Math.ceil(player.stats.xp / 5);
    if (player.stats.level === 0) {
      player.stats.level = 1;
    }

    this.props.updateState({
      map: map,
      player: player
    });
  }

  render() {
    return (
      <div>
        {this.drawMap()}
      </div>
    );
  }
}
