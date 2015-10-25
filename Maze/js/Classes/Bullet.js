var Bullet = function (bulletMaterial1, bulletMaterial2, shooter, target, scene) {
	var bullet = BABYLON.MeshBuilder.CreateSphere('bullet'+Math.floor(Math.random()*1000), {diameter: 0.08}, scene);
	bullet.direction = target.subtract(shooter.position).normalize();
	//bullet.direction.y += 0.003;
	bullet.scaling.z = 30;
	bullet.rotation = shooter.rotation.clone();
	bullet.material = bulletMaterial2;

	var bulletOutside = BABYLON.MeshBuilder.CreateSphere('bulletOutside', {diameter: 0.1}, scene);
	bulletOutside.material = bulletMaterial1;
	bulletOutside.parent = bullet;
	bulletOutside.flipFaces(true);

	bullet.outside = bulletOutside;

	return bullet;
};