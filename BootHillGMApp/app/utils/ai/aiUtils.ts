export function determineIfWeapon(itemName: string | null | undefined): boolean {
    // Handle null, undefined, or non-string values
    if (!itemName || typeof itemName !== 'string') {
        return false;
    }
    
    const weaponKeywords = ['gun', 'pistol', 'rifle', 'sword', 'knife', 'dagger', 'axe', 'bow', 'arrow', 'club', 'mace', 'spear', 'whip', 'tomahawk', 'blackjack', 'brass knuckles', 'derringer', 'revolver', 'shotgun', 'carbine', 'musket', 'blunderbuss', 'saber', 'cutlass', 'rapier', 'scimitar', 'katana', 'tanto', 'kukri', 'hatchet', 'morning star', 'flail', 'halberd', 'lance', 'javelin', 'sling', 'crossbow', 'grenade', 'dynamite', 'molotov', 'bomb', 'cannon', 'mortar', 'rocket', 'missile', 'laser', 'phaser', 'plasma', 'railgun', 'gauss', 'tesla', 'flamethrower', 'chainsaw', 'bat', 'pipe', 'crowbar', 'hammer', 'wrench', 'pliers', 'screwdriver', 'shovel', 'pickaxe', 'hoe', 'sickle', 'scythe', 'adze', 'awl', 'chisel', 'file', 'rasp', 'plane', 'saw', 'drill', 'punch', 'clamp', 'vise', 'anvil', 'forge', 'tongs', 'hammer', 'mallet', 'axe', 'hatchet', 'adze', 'awl', 'chisel', 'file', 'rasp', 'plane', 'saw', 'drill', 'punch', 'clamp', 'vise', 'anvil', 'forge', 'tongs', 'hammer', 'mallet'];
    const lowerCaseItemName = itemName.toLowerCase();
    return weaponKeywords.some(keyword => lowerCaseItemName.includes(keyword));
}
