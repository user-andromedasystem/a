const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

let player;
let platforms;
let cursors;
let score = 0;
let scoreText;
let lives = 3;
let livesText;
let collectibles;

function preload() {
  this.load.setPath('public/assets');
  this.load.image("sky", "https://labs.phaser.io/assets/skies/sky1.png");
  this.load.image("ground", "https://labs.phaser.io/assets/sprites/platform.png");
  this.load.image("leaf", "https://raw.githubusercontent.com/user-andromedasystem/a/main/leafimg.png"); // Replace with your leaf image URL
  this.load.spritesheet("dude", "https://labs.phaser.io/assets/sprites/dude.png", { frameWidth: 32, frameHeight: 48 });
}

function create() {
  this.add.image(400, 300, "sky");

  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, "ground").setScale(2).refreshBody();

  // Create the player with the spritesheet
  player = this.physics.add.sprite(100, 450, "dude");

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  this.physics.add.collider(player, platforms);

  // Create animations for the player
  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  cursors = this.input.keyboard.createCursorKeys();

  // Create collectibles (leaves)
  collectibles = this.physics.add.group({
    key: "leaf",
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 },
  });

  collectibles.children.iterate(function (child) {

    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    child.setCollideWorldBounds(true);
    child.setVelocity(Phaser.Math.Between(-20, 20), 20);
    child.setScale(0.25); // Adjust the scale factor as needed (0.5 means 50% of the original size)

  });

  this.physics.add.collider(collectibles, platforms);
  this.physics.add.overlap(player, collectibles, collectLeaf, null, this);

  scoreText = this.add.text(16, 16, "Score: 0", {
    fontSize: "32px",
    fill: "#fff",
  });
}

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("left", true); // Play left animation
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("right", true); // Play right animation
  } else {
    player.setVelocityX(0);
    player.anims.play("turn"); // Play turn animation
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }

  // Slam mechanic (works in air)
  if (cursors.down.isDown) {
    player.setVelocityY(500); // Adjust the value for slam strength
  }
}

function collectLeaf(player, leaf) {
  leaf.disableBody(true, true);
  score += 10;
  scoreText.setText("Score: " + score);

  if (collectibles.countActive(true) === 0) {
    collectibles.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });
  }
}