# Read My Bible Quest turnarounds

These are eight-view, transparent PNG sprite sheets based on the explorer in the supplied screenshot. Each sheet is 1344 × 1170 pixels, arranged as four columns and two rows. Each cell is 336 × 585 pixels.

Read the views left to right: front, front right, right side, back right, back, back left, left side, front left. The wardrobe lets players drag or use the arrow buttons to step between views.

`base-character.webp` is the boy reference. Each of the 28 boy item files matches an `id` in `../cosmetics.js`: 10 accessories, 5 trails, 5 jetpacks, and 8 outfits. The `girl/` folder contains the girl reference and matching accessory, trail, jetpack, and hairstyle art. Her outfit views reuse the existing eight suit palettes through `../character-art.js`.

The game offers five hairstyles per profile. Boys can choose bangs, spiky hair, afro, cropped hair, or bald. Girls can choose a ponytail, curly braids, long straight hair, short straight hair, or the half-up curls from the supplied reference. Each non-bald style has three natural hair colors applied in the browser. Older unused hairstyle files remain in the folders but are not offered in the game. The profile's boy or girl choice determines which set appears.

`boy-flight-outfits.webp` and `girl-flight-outfits.webp` are four-column, two-row flying pose sheets. They follow outfit order in `../app.js`. `../bible-decor.webp` contains four room Bible designs, from simple to ornate.

These are illustrated sprite turnarounds, not a rigged 3D model. The gallery and wardrobe can spin one selected item at a time for the current profile. Skin tone, eye color, hairstyle, and hair color selections are applied in the browser. Sky Run chooses a flying pose from the equipped outfit, with the selected trail effect and accessory artwork. Arbitrary combinations do not have separate eight-angle sheets.
