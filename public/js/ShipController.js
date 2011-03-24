var ShipController = new Class({
				Extends: JxlSprite,
				initialize: function(graphic, x, y) {
					  this.parent(graphic, x, y, 36, 36);
					  this.rotatespeed = 10;
					  this.movespeed = 0;
					  this.angle = 90;
					  this.maxspeed = 1.2;
					  this.forward = {};
					  this.forward.x = this.x;
					  this.forward.y = this.y;
					  this.drag = new JxlPoint(50, 50);
					  this.exploading = false;
					  this.addAnimation("default_skin", [321],  0.05, true); // We only need a single frame.
					  this.play("default_skin"); // This should set our image to the single frame. 
				},
				
				update: function(game, time) {
				  this.controlmove(game, time);
				  this.parent(game, time);
				  this.wrap_to_window(game);
				},
				
				wrap_to_window: function(game) {
				},
				
				on_death: function(game) {
					var DeathAnim = new Explosion(JixelInstance.am.get("explosions"), this.x, this.y, 2000);
					JixelInstance.state.add(DeathAnim);
					this.exploading = true;
					
					var ship = this; // fucking context switches.
					DeathAnim.explode(function() {
							ship.exploading = false;
							JixelInstance.state.remove(DeathAnim);
					});
				},
				
				controlmove: function(game, time) {
					this.movespeed = 0;
					if("A" in game.keys) {
						this.angle += -1*this.rotatespeed;
						this.angle.clamp(0, 360);
					}
					if("D" in game.keys) {
						this.angle += this.rotatespeed;
						this.angle.clamp(0, 360);
					}
					if("W" in game.keys) {
						this.movespeed = 1;
					}
					if("S" in game.keys) {
					    this.movespeed =  -1;
					}
					
					if("SPACE" in game.keys) {
						if(!this.exploading)
							this.on_death();
					}
					
					this.velocity.x += Math.sin(this.angle * (Math.PI / 180)) * (this.movespeed / time);
					this.velocity.y -= Math.cos(this.angle * (Math.PI / 180)) * (this.movespeed / time);
					this.velocity.x.clamp(-1*this.movespeed, this.movespeed);
					this.velocity.y.clamp(-1*this.movespeed, this.movespeed);					
					this.forward.x  += Math.sin(this.angle * (Math.PI / 180));
					this.forward.y  -= Math.cos(this.angle * (Math.PI / 180));
				}
				
			});