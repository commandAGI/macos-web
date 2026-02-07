<script lang="ts">
	type Note = { id: number; title: string; preview: string; content: string; date: string };

	const sample_notes: Note[] = [
		{
			id: 1,
			title: 'Meeting Notes',
			preview: 'Discussed Q1 roadmap priorities and timeline...',
			content: 'Discussed Q1 roadmap priorities and timeline.\n\n- Feature A launches Feb 15\n- Feature B needs design review\n- Hiring: 2 new engineers by March\n\nAction Items:\n- Schedule follow-up with design team\n- Review budget allocations\n- Send summary to stakeholders',
			date: 'Jan 15, 2024',
		},
		{
			id: 2,
			title: 'Shopping List',
			preview: 'Groceries for the week...',
			content: 'Groceries for the week:\n\n- Milk\n- Eggs\n- Bread\n- Avocados\n- Chicken breast\n- Rice\n- Broccoli\n- Olive oil\n- Coffee beans\n- Dark chocolate',
			date: 'Jan 14, 2024',
		},
		{
			id: 3,
			title: 'Book Recommendations',
			preview: 'Books to read in 2024...',
			content: 'Books to read in 2024:\n\n1. "Thinking, Fast and Slow" - Daniel Kahneman\n2. "The Design of Everyday Things" - Don Norman\n3. "Sapiens" - Yuval Noah Harari\n4. "Atomic Habits" - James Clear\n5. "The Pragmatic Programmer" - Hunt & Thomas',
			date: 'Jan 12, 2024',
		},
		{
			id: 4,
			title: 'Recipe: Pasta Carbonara',
			preview: 'Ingredients and steps for carbonara...',
			content: 'Ingredients:\n- 400g spaghetti\n- 200g guanciale\n- 4 egg yolks + 2 whole eggs\n- 100g Pecorino Romano\n- Black pepper\n\nSteps:\n1. Cook pasta in salted water\n2. Crisp guanciale in a pan\n3. Mix eggs with grated cheese\n4. Combine hot pasta with guanciale\n5. Add egg mixture off heat\n6. Toss until creamy, season with pepper',
			date: 'Jan 10, 2024',
		},
		{
			id: 5,
			title: 'Project Ideas',
			preview: 'Potential side projects to explore...',
			content: 'Potential side projects to explore:\n\n1. Personal finance tracker app\n2. Recipe sharing platform\n3. Automated plant watering system\n4. Local community events board\n5. Language learning flashcard tool',
			date: 'Jan 8, 2024',
		},
	];

	let selected_note = $state<Note>(sample_notes[0]);
	let editor_content = $state(sample_notes[0].content);

	function select_note(note: Note) {
		selected_note = note;
		editor_content = note.content;
	}
</script>

<section class="container">
	<header class="app-window-drag-handle titlebar"></header>

	<div class="main">
		<aside class="sidebar">
			<div class="search-bar">
				<input type="text" placeholder="Search" />
			</div>
			<div class="note-list">
				{#each sample_notes as note}
					<button
						class="note-card"
						class:active={selected_note.id === note.id}
						onclick={() => select_note(note)}
					>
						<div class="note-title">{note.title}</div>
						<div class="note-meta">
							<span class="note-date">{note.date}</span>
							<span class="note-preview">{note.preview}</span>
						</div>
					</button>
				{/each}
			</div>
		</aside>

		<div class="editor">
			<div class="editor-header">
				<h2>{selected_note.title}</h2>
				<span class="editor-date">{selected_note.date}</span>
			</div>
			<textarea
				bind:value={editor_content}
				spellcheck="false"
			></textarea>
		</div>
	</div>
</section>

<style>
	.container {
		height: 100%;
		width: 100%;
		background-color: var(--system-color-light);
		border-radius: inherit;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		font-family: var(--system-font-family);
		color: var(--system-color-light-contrast);
	}

	.titlebar {
		padding: 12px;
		min-height: 36px;
		background: linear-gradient(to bottom, #f6f6f6, #ededef);
		border-bottom: 1px solid #d1d1d6;

		:global(body.dark) & {
			background: linear-gradient(to bottom, #3a3a3c, #2c2c2e);
			border-bottom-color: #1c1c1e;
		}
	}

	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.sidebar {
		width: 240px;
		min-width: 240px;
		background-color: #f2f2f7;
		border-right: 1px solid #d1d1d6;
		display: flex;
		flex-direction: column;
		overflow: hidden;

		:global(body.dark) & {
			background-color: #1c1c1e;
			border-right-color: #38383a;
		}
	}

	.search-bar {
		padding: 8px;

		input {
			width: 100%;
			padding: 6px 10px;
			border: none;
			border-radius: 8px;
			background-color: rgba(0, 0, 0, 0.06);
			font-size: 13px;
			color: var(--system-color-light-contrast);

			&::placeholder {
				color: #86868b;
			}

			:global(body.dark) & {
				background-color: rgba(255, 255, 255, 0.08);
			}
		}
	}

	.note-list {
		flex: 1;
		overflow-y: auto;
	}

	.note-card {
		width: 100%;
		padding: 10px 12px;
		border: none;
		background: rgba(255, 235, 150, 0.15);
		cursor: pointer;
		text-align: left;
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);

		&:hover {
			background: rgba(255, 235, 150, 0.25);
		}

		&.active {
			background: #ffd60a;
			color: #1c1c1e;
		}

		:global(body.dark) & {
			background: rgba(255, 214, 10, 0.08);
			color: white;
			border-bottom-color: rgba(255, 255, 255, 0.04);

			&:hover {
				background: rgba(255, 214, 10, 0.15);
			}

			&.active {
				background: #ffd60a;
				color: #1c1c1e;
			}
		}
	}

	.note-title {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 4px;
	}

	.note-meta {
		display: flex;
		gap: 8px;
		font-size: 12px;
		color: #86868b;
	}

	.note-date {
		white-space: nowrap;
	}

	.note-preview {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.note-card.active .note-meta {
		color: rgba(28, 28, 30, 0.6);
	}

	.editor {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		padding: 16px;
		background: #fffef5;

		:global(body.dark) & {
			background: #2c2c2e;
		}
	}

	.editor-header {
		margin-bottom: 12px;

		h2 {
			font-size: 22px;
			font-weight: 700;
			margin: 0 0 4px;
		}
	}

	.editor-date {
		font-size: 12px;
		color: #86868b;
	}

	textarea {
		flex: 1;
		width: 100%;
		border: none;
		background: none;
		font-family: var(--system-font-family);
		font-size: 14px;
		line-height: 1.6;
		color: var(--system-color-light-contrast);
		resize: none;
		outline: none;
	}
</style>
