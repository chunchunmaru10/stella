<script>
	import { Button, Carousel, Hr } from 'flowbite-svelte';
	import Modal from '../../components/common/Modal.svelte';

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
		information stated above are included in the screenshot.
	</p>

	<Modal>
		<Button slot="button" let:dialog on:click={() => dialog.open()}>See Examples</Button>
		<div>
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
			<div class="mt-4 flex w-full items-center justify-center rounded-md bg-gray-600 p-2">
				{imageDescription}
			</div>
		</div>
	</Modal>

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
		recommendation is SPD &gt; CRIT DMG = CRIT Rate &lt; ATK%, then <i>n</i> would be 3, since there
		are 3 levels of substats recommended. Each tier is then assigned points according to how good
		they are with <i>n</i> being the max point. Using the previous example, SPD would be given 3 points,
		CRIT DMG and CRIT Rate would be given 2 points, and ATK% would be given 1 point. This is before taking
		into account any substat upgrades the relic might have.
	</p>
	<p></p>
	<p>
		Maximum potential rating is a rating that assumes the best possible substat combination a relic
		piece can get with regards to the character that is using it, and the main stat that it has. If
		Character A&apos;s body piece&apos;s main stat should be HP%, then HP% will be excluded from the
		substats calculation, even if it is in the list of good substats. If the relic's main stat is
		different from the main stat(s) recommended, the relic will then disregard all substats no
		matter how good they are.
	</p>
	<p>What Stella doesn&apos;t consider in its calculations:</p>
	<ul>
		<li>
			How the relic has rolled (A level 15 relic will be rated the same as a level 1 relic if their
			substats are the same)
		</li>
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
		For example, if Character A&apos;s substats recommendations are
		<b>SPD (Breakpoint) &gt; CRIT RATE = CRIT DMG &gt; ATK% </b>, then the substats will have the
		following ratings assigned to them:
	</p>
	<ul>
		<li>SPD (5 points, best substat)</li>
		<li>CRIT RATE (4 points, second best substat)</li>
		<li>CRIT DMG (4 points, second best substat)</li>
		<li>ATK% (3 points, third best substat)</li>
		<li>All other substats (0 points)</li>
	</ul>
	<p>
		And consider the following relic piece (assuming Character A uses this relic set, and their feet
		piece main stat recommendation is SPD):
	</p>
	<img src="./relic_4.webp" alt="Example Relic" class="my-0 w-64" />

	<p>The maximum potential value of this relic set is 11, which can be broken down into:</p>
	<ul>
		<li>SPD (0 points, because its the main stat), plus,</li>
		<li>CRIT Rate (4 points, second best substat), plus,</li>
		<li>CRIT DMG (4 points, second best substat), plus,</li>
		<li>ATK% (3 points, third best substat)</li>
	</ul>

	<p>The actual value of this relic piece is 7, which can be broken down into:</p>
	<ul>
		<li>ATK% (3 points), plus,</li>
		<li>CRIT Rate (4 points), plus,</li>
		<li>Effect RES and Break Effect (0 points)</li>
	</ul>

	<h3>Actual vs Potential Rating</h3>
	<p>
		In settings, you can toggle to display the potential ratings instead of the actual ratings
		(default). A potential rating only applies to relics that only has 3 substats, which assumes
		that the fourth substats is always the best substats a relic can get (taking into account the
		sub and main stats that have already been obtained). This can help you to decide whether a relic
		is worth leveling up or not when it is still at level 0.
	</p>

	<Hr />

	<h2 id="batchImport">Batch Import</h2>

	<p>
		Batch import makes it easy to bring in a large number of relics at once. To use this feature,
		you'll need a relic scanner. The scanner creates a <a
			href="https://www.w3schools.com/whatis/whatis_json.asp"
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
		When importing via HSR Scanner, it's advisable to scan only 5-star relics (you can adjust this
		setting via the app) since Stella treats all relics as 5-star. That said, even if lower-rarity
		relics are included, the rating system should still function, albeit displaying all relics with
		a gold background (rather than purple for 4-star etc). While the HSR Scanner supports character
		and light cone scanning, this data would be ignored by Stella. Hence, if you're solely using
		this tool to import into Stella, you can deselect those options to speed up the scanning
		process.
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
