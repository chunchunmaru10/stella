<script>
	import { Carousel, Hr } from 'flowbite-svelte';

	let imageDescription = '';
</script>

<section class="prose dark:prose-invert prose-h2:mt-6 prose-img:rounded-lg min-w-full pb-8">
	<h1 class="mb-0 text-3xl font-bold">Info</h1>
	<p>
		Stella is a Honkai: Star Rail relic rating tool that helps players to decide whether a relic is
		worth upgrading/keeping or should be salvaged. It is meant to be as generic as possible without
		doing any damage calculations.
	</p>

	<Hr />

	<h2>How Does it Work and How to Use</h2>
	<p>
		Stella uses an image-recognition library to recognize text from image. So, first take a
		screenshot of a relic, and either paste, drag and drop, or plain click and upload the image to
		get started, keep in mind that only JPG, PNG, and WebP formats are accepted. The engine then
		extracts the following information from the image (in order):
	</p>
	<ol>
		<li>The name of the set to determine the set</li>
		<li>The name of the relic piece to determine the piece type</li>
		<li>Based on the piece type, the main stat available for that piece</li>
		<li>Substats that are lines below the main stat</li>
		<li>Depending on the value of the main stat, determine the possible rarities</li>
		<li>
			For each possible rarity, check if the upgrade combinations match the substat's value until a
			match is found
		</li>
	</ol>

	<p>
		Note that if any of the steps fail, the whole process will fail. Make sure that all the
		information stated above are included in the screenshot. Additionally, due to the limitations of
		image processing library that is used, the text in the image could sometimes be not recognized
		correctly, especially the translucent background in the inventory screen, causing the rating
		algorithm to fail. If an image fails to be recognized, you can try facing the a darker
		background to increase the contrast.
	</p>

	<div class=" mx-auto w-96 max-w-full">
		<Carousel
			imgClass="object-contain h-full w-fit px-16 m-0"
			let:Controls
			images={[
				'This is fine',
				'This is also fine',
				'This will give an error (Missing relic name)'
			].map((text, i) => ({
				src: `./relic_${i + 1}.webp`,
				alt: text
			}))}
			on:change={({ detail }) => (imageDescription = detail.alt)}
		>
			<Controls />
		</Carousel>
		<div class="mx-auto mt-4 flex items-center justify-center rounded-md bg-gray-600 p-2">
			{imageDescription}
		</div>
	</div>

	<Hr />

	<h2>Rating Calculation</h2>
	<p>
		All released characters&apos; relic sets and stats suggestions are sourced from {' '}
		<a href="https://www.prydwen.gg/star-rail/characters" target="_blank">Prydwen</a>. If a
		character is not released, then it can be sourced on various places. (You can enable unreleased
		characters in Settings.)
	</p>
	<p>
		Stella categorizes substats into <i>n</i> tiers, where <i>n</i> is the number of different
		levels of substats that are suitable for a character. For example, if a character substats
		recommendation is SPD &gt; CRIT DMG = CRIT Rate &gt; ATK%, then <i>n</i> would be 3, since there
		are 3 levels of substats recommended. Each tier is then assigned points according to how good
		they are with <i>n</i> being the max point. Using the previous example, SPD would be given 3 points,
		CRIT DMG and CRIT Rate would be given 2 points, and ATK% would be given 1 point. This is before taking
		into account any substat upgrades the relic might have.
	</p>
	<p>
		Stella also takes into account how many times a substat has been rolled into and whether if it
		is a high roll or low roll. Every 3 levels, a random substat can be upgraded, but the upgraded
		values are random between three different values (which are sourced from the
		<a href="https://honkai-star-rail.fandom.com/wiki/Relic/Stats" target="_blank">
			Honkai: Star Rail Wiki page</a
		>). The points given to each substats mentioned in the previous paragraph assumes that the
		substat has rolled the highest values. If that is not the case, then a percentage penalty is
		applied based on the difference between the rolled value and the maximum value possible. For
		example, if a substat has 3 possible rolls everytime its upgraded, 100, 90, and 80, and it is
		worth 3 points. If the substat has rolled 90, then the point will be
		<i>90 (current value) / 100 (max value) * 2 (points) = 1.8</i>. If the substat has been
		upgraded, then the values and points are added up.
	</p>
	<p>What Stella doesn&apos;t consider in its calculations:</p>
	<ul>
		<li>
			How good the set is on the character. If Relic A, B, and C are viable options for a character,
			even if Relic A is considered best in slot, if their substats are the same, they will all be
			rated the same. (But Relic D will not be rated)
		</li>
		<li>
			Breakpoints. Since Stella does not have any idea on how your character is built, it will
			disregard breakpoints and always assign points to the substats as is, even if the substats may
			have went over the breakpoint listed in Pyrdwen.
		</li>
	</ul>

	<h3>Example</h3>
	<p>
		If Character A&apos;s substats recommendations are
		<b>SPD (Breakpoint) &gt; CRIT RATE = CRIT DMG &gt; ATK% </b>, then the substats will have the
		following ratings assigned to them (assuming that they all have the highest roll):
	</p>
	<ul>
		<li>SPD (3 points, best substat)</li>
		<li>CRIT RATE (2 points, second best substat)</li>
		<li>CRIT DMG (2 points, second best substat)</li>
		<li>ATK% (1 points, third best substat)</li>
		<li>All other substats (0 points)</li>
	</ul>
	<p>
		And consider the following relic piece (assuming Character A uses this relic set, and their feet
		piece main stat recommendation is SPD):
	</p>
	<img src="./relic_4.webp" alt="Example Relic" class="my-0 w-64" />

	<p>The maximum possible rating of this relic for character A will be 13, which can happen if:</p>
	<ul>
		<li>
			It has CRIT Rate & CRIT DMG as its initial substats, and subsequent upgrades all went into
			either of them with max rolls (2 + 2 + (2 * 4) = 12 points, second best substat). Note that
			CRIT Rate and CRIT DMG's points are multiplied by 4, this is because the relic's substats has
			been upgraded 4 times (at level 3, 6, 9, and 12). Assuming the best possible scenario, all
			upgrades will go into the best substat, which in this case is CRIT Rate and CRIT DMG.
		</li>
		<li>
			It has ATK% as its initial substats with max roll, which is worth 1 point as it is the third
			best substat
		</li>
		<li>
			Any substat as its fourth substats, the value of which doesn&apos;t matter since only three
			substats are good for this character. But we still need a fourth substat since we do not want
			to waste 1 upgrade just to get another substat.
		</li>
		<li>
			SPD is ignored here even if it is recommended because it cannot be a substat if it is already
			a main state.
		</li>
	</ul>

	<p>The actual rolls that this relic has are:</p>
	<ul>
		<li>ATK% - 7.3% (3.888 + 3.456)</li>
		<li>CRIT Rate% - 3.2% (3.24)</li>
		<li>Effect RES - 8.2% (4.32 + 3.888)</li>
		<li>Break Effect - 11.6% (6.48 + 5.184)</li>
	</ul>

	<p>The actual value of this relic piece is about 3.7 points, which can be broken down into:</p>
	<ul>
		<li>ATK% (1.7 points)</li>
		<ul>
			<li>
				ATK%&apos;s maximum possible roll is 4.32, each rolls are then penalized according to the
				difference between max roll and current roll
			</li>
			<li>3.888 / 4.32 * 1 = 0.9 points, plus,</li>
			<li>3.456 / 4.32 * 1 = 0.8 points</li>
		</ul>
		<li>CRIT Rate (2 points)</li>
		<ul>
			<li>
				CRIT Rate&apos;s maximum possible roll is 3.24, which this relic got, but it has only 1
				roll. So it got its full 2 points.
			</li>
		</ul>
		<li>
			Effect RES and Break Effect will have 0 points since they are not suitable for this character.
		</li>
	</ul>

	<p>Overall, this relic is worth 3.7 / 13 points for character A.</p>

	<h3 id="futurePotentialUpgrades">Future Potential Upgrades</h3>
	<div class="max-w-96 object-scale-down">
		<img src="./show_future_upgrades_toggle.webp" alt="Show Future Upgrades Toggle" />
	</div>
	<p>
		There is a toggle option to switch between the current value and the potential value of a relic.
		When activated, this toggle assumes that any future upgrades to the relic will always be the
		most optimal for each character. For instance, if the relic has only 3 out of 4 possible
		substats, it will assume that the fourth substat will be the most beneficial for the character.
		If the optimal substat(s) are already present, it will instead choose the next best substat. If
		the relic already has all possible substats, the toggle will assume that any future upgrades
		will be allocated to the substat with the highest value among those present. Therefore, if you
		input a max-level relic, toggling the option on or off will have the same effect, as the relic
		can no longer be upgraded.
	</p>

	<Hr />

	<h2 id="batchImport">Batch Import</h2>

	<p>
		Batch import makes it easy to bring in a large number of relics at once. To use this feature,
		you'll need a relic scanner. The scanner creates a <a
			href="https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON"
			target="_blank">JSON</a
		> file output, which you can then import into the batch importer to analyze the relics. Currently,
		there are only two source file formats available. For more details on each format, please see the
		sections below.
	</p>

	<h3>Import Formats</h3>

	<h4>Stella</h4>
	<p>
		As Stella doesn't include a scanner, you can only access the JSON data file format once you've
		batch imported using another scanner. Once completed, you can export it by selecting "Export"
		from the dropdown menu at the top right corner of the batch import page. After completing this
		step, you can then select this JSON file to import as Stella format in the future.
	</p>

	<h4><a href="https://github.com/kel-z/HSR-Scanner" target="_blank">HSR Scanner</a></h4>
	<p>
		When importing via the HSR Scanner, the "Import Order" sort option will be based on the relic
		order in the provided JSON file. Since the scanner alone cannot determine the relic's obtainment
		date, it is recommended to first sort the relics in the game by the date obtained, then scan
		them with the HSR Scanner, and finally import them into Stella. While this approach may help
		preserve the relic's obtainment date, it is not guaranteed, as the HSR Scanner does not
		explicitly ensure that the scanning order matches the output order.
	</p>

	<h3>Interface</h3>
	<img
		src="./batch_relic_item_example.webp"
		alt="Batch Relic Item Example"
		width="128"
		height="128"
	/>
	<p>
		After importing, the numbers at the top right corner of the relic indicate how many characters
		can use that relic based on your settings (whether you have excluded characters, minimum rating
		threshold and etc). Each relic is clickable, and clicking on it will display a pop-up with more
		details about the relic, similar to the one on the homepage.
	</p>

	<Hr />

	<h2>Report Bugs, Inaccuracy, or Request Features</h2>
	<p>
		For bug reports, inaccuracies, or feature requests, feel free to reach out on Discord:
		<a href="https://discord.com/users/255625674025336832" target="_blank">@chunchunmaru10</a>
	</p>
</section>
