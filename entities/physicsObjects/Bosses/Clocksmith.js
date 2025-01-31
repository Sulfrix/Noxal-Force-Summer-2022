class Clocksmith extends Boss{
    constructor(arenaCenter, arenaSize, difficulty){
        super(arenaCenter, arenaSize);

        // runSpeed is in a getter
        this.dashAttackSpeed = 20;

        this.difficulty =     difficulty;
        this.agressiveness =  this.difficulty;
        this.attackPower =    1 + (this.difficulty-1)/3;
        this.shootSpeed =     this.runSpeed * (this.difficulty-1)/5;
        this.localSpeedMult = 1 + (this.difficulty-1)/6;
        this.dodgePower =     1 + (this.difficulty-1)/3;

        this.speed = this.runSpeed;
        this.normalFriction = 4;
        this.friction = this.normalFriction;
        
        this.minimumDistanceToDodge = 20 * (this.dodgePower + 4)/5;
        this.distanceToDodge = 60 * (this.dodgePower + 4)/5;

        this.dodgeDist = 60 * (this.dodgePower + 4)/5;
        this.dodgeTime = 0.3;
        
        this.health = 3;

        this.normalMinDistance = 100 / this.dodgePower;
        this.normalMaxDistance = 120 / this.dodgePower;
        this.minDistance = this.normalMinDistance;
        this.maxDistance = this.normalMaxDistance;
        
        this.knockbackSpeed = 50;
        this.knockbackTime = 0.5;
        
        this.normalLookAheadTime = 0.8;
        this.lookAheadTime = this.normalLookAheadTime;

        this.myBots = [];

        this.botCooldown = 10 / this.agressiveness;

        this.createBots(arenaSize.y/2, 2*PI, 6, PI/6);

    }

    createAttackManager(){
        this.attackManager = new AttackManager(this);
        let comboList = []

        comboList.push(new Combo('pistol',
        [
            [new Pistol(this, 0.6, 0)]
        ]));

        comboList.push(new Combo('dashAttack',
        [
            [new ShortDashAttack(this, 0.5, 0)]
        ]));

        this.attackManager.addComboList(comboList);
        this.attackManager.waitForSeconds(1/this.agressiveness);
    }
    
    createAnimations(){
        let listOfAnimations = [];


        let attackAnimation = {
            parent: this, 
            name: 'attack',
            animation: new Animator('attack', bossImages.attack, 0.3),
            get canRun(){
                return this.parent.attackAnimation && !this.parent.isDodging;
            }
        }
        listOfAnimations.push(attackAnimation);


        let botAnimation = {
            parent: this,
            name: 'bot',
            animation: new Animator('bot', bossImages.bot, 1),
            get canRun(){
                console.log(this.parent.distanceToPlayer, this.parent.minDistance, this.parent.distanceToPlayer > this.parent.minDistance);
                return this.parent.distanceToPlayer > this.parent.minDistance;
            }
        }
        listOfAnimations.push(botAnimation);

        
        let idleAnimation = {
            parent: this,
            name: 'idle',
            animation: new Animator('idle', bossImages.idle, 0.8),
            get canRun(){
                return true;
            }
        }
        listOfAnimations.push(idleAnimation);

        this.animationManager = new AnimationManager(listOfAnimations);
    }

    createBots(distance, angleChange, numBots, offset = 0){
        let startAngle = this.angleToPlayer - angleChange/2 + offset;

        for(let i = 0; i < numBots; i++){
            let angle = startAngle + i*angleChange/numBots;
            
            let newBoss = new ClocksmithBot(this.arenaCenter, this.arenaSize, this.difficulty);

            let newBossPosition = new Vector(distance, 0);
            newBossPosition.angle = angle;
            newBoss.position = newBossPosition.add(this.position);

            newBoss.parent = this;
            newBoss.setIndex();

            this.myBots.push(newBoss);
        }

        time.delayedFunction(this, 'createBots', this.botCooldown, [30, PI, 3]);
    }

    killBoss(){
        super.killBoss();
        time.stopFunctions(this, 'createBots');
    }

    get runSpeed(){
        if(this.distanceToPlayer > this.minDistance) return 4;
        return 9;
    }
    
    endKnockback(){
        super.endKnockback();
        this.healthBar.stopDisplay();
        this.teleportAway();

        time.stopFunctions(this, 'createBots')
        this.createBots(20, 2*PI, 5);
    }

    teleportAway(){
        this.position = this.arenaCenter;

        let newVector = new Vector(this.arenaSize.y/2, 0);
        newVector.angle = this.angleToPlayer + PI;

        this.position = this.position.add(newVector);
    }
}