(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HorseProfiles = factory();
}(this, function () {
  'use strict';
  return [
    { id: 'buttercup', name: 'Buttercup', age: 7, breed: 'Quarter Horse', distance: 3,
      location: 'Palo Alto', photo: 'img/profiles/vid01.jpg', likesYou: true,
      bio: 'Emotionally available. Physically in a field. Looking for someone to split a hay bale with.',
      interests: ['Trail rides', 'Carrots', 'Long weekends'] },
    { id: 'sir-gallops', name: 'Sir Gallops', age: 9, breed: 'Thoroughbred', distance: 8,
      location: 'Los Altos', photo: 'img/profiles/vid03.jpg', likesYou: false,
      bio: 'Retired from the rat race. Still very much in the horse race. Will race you to the gate.',
      interests: ['Racing', 'Mountain views', 'Second breakfast'] },
    { id: 'maple', name: 'Maple', age: 6, breed: 'Arabian', distance: 12,
      location: 'Woodside', photo: 'img/profiles/vid04.jpg', likesYou: true, superLikesYou: true,
      bio: 'A little dramatic, a lot of mane. My love language is bringing you the good grass.',
      interests: ['Dressage', 'Sunsets', 'Good grass'] },
    { id: 'oat-milk', name: 'Oat Milk', age: 5, breed: 'Quarter Horse', distance: 18,
      location: 'Portola Valley', photo: 'img/profiles/vid05.jpg', likesYou: false,
      bio: 'Bay Area native. Plant based. Looking for a connection with fewer strings than my lead rope.',
      interests: ['Hay tasting', 'Trail rides', 'Naps'] },
    { id: 'clementine', name: 'Clementine', age: 8, breed: 'Warmblood', distance: 24,
      location: 'Half Moon Bay', photo: 'img/profiles/vid06.jpg', likesYou: true,
      bio: 'Beach walks are better on four legs. You bring the carrots, I will bring the unreasonable confidence.',
      interests: ['Beach rides', 'Jumping', 'Carrots'] },
    { id: 'neighthan', name: 'Neighthan', age: 10, breed: 'Thoroughbred', distance: 36,
      location: 'San Jose', photo: 'img/profiles/vid09.jpg', likesYou: false,
      bio: 'Stable job. Own place in a shared barn. Ready to settle down, ideally somewhere with a salt lick.',
      interests: ['Barn life', 'Grooming', 'Quiet mornings'] }
  ];
}));
