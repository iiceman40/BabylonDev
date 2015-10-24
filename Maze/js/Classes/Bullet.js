var Bullet = function (bulletMaterial1, bulletMaterial2, player, scene) {
	var bullet = BABYLON.MeshBuilder.CreateSphere('bullet', {diameter: 0.08}, scene);
	bullet.direction = player.getTarget().subtract(player.position).normalize();
	bullet.direction.y += 0.003;
	bullet.scaling.z = 100;
	bullet.rotation = player.rotation.clone();
	bullet.material = bulletMaterial2;

	var bulletOutside = BABYLON.MeshBuilder.CreateSphere('bullet', {diameter: 0.1}, scene);
	bulletOutside.material = bulletMaterial1;
	bulletOutside.parent = bullet;
	bulletOutside.flipFaces(true);

	bullet.outside = bulletOutside;

	return bullet;
};