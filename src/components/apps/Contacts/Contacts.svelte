<script lang="ts">
	type Contact = {
		name: string;
		phone: string;
		email: string;
		address: string;
		company: string;
		avatar: string;
		color: string;
	};

	const contacts: Contact[] = [
		{ name: 'Alice Johnson', phone: '+1 (555) 123-4567', email: 'alice@example.com', address: '123 Oak Street, San Francisco, CA', company: 'TechCorp', avatar: 'AJ', color: '#007aff' },
		{ name: 'Bob Smith', phone: '+1 (555) 234-5678', email: 'bob@example.com', address: '456 Pine Avenue, New York, NY', company: 'DesignHub', avatar: 'BS', color: '#34c759' },
		{ name: 'Carol Davis', phone: '+1 (555) 345-6789', email: 'carol@example.com', address: '789 Elm Drive, Austin, TX', company: 'StartupInc', avatar: 'CD', color: '#ff9500' },
		{ name: 'David Wilson', phone: '+1 (555) 456-7890', email: 'david@example.com', address: '321 Maple Lane, Seattle, WA', company: 'CloudBase', avatar: 'DW', color: '#ff3b30' },
		{ name: 'Eve Martinez', phone: '+1 (555) 567-8901', email: 'eve@example.com', address: '654 Birch Road, Denver, CO', company: 'DataFlow', avatar: 'EM', color: '#af52de' },
		{ name: 'Frank Brown', phone: '+1 (555) 678-9012', email: 'frank@example.com', address: '987 Cedar Way, Portland, OR', company: 'NetSystems', avatar: 'FB', color: '#5856d6' },
		{ name: 'Grace Lee', phone: '+1 (555) 789-0123', email: 'grace@example.com', address: '147 Walnut Street, Boston, MA', company: 'BioTech', avatar: 'GL', color: '#ff2d55' },
		{ name: 'Henry Taylor', phone: '+1 (555) 890-1234', email: 'henry@example.com', address: '258 Spruce Blvd, Chicago, IL', company: 'FinanceFirst', avatar: 'HT', color: '#5ac8fa' },
	];

	let selected = $state(0);
	let search_query = $state('');

	const selected_contact = $derived(contacts[selected]);

	const filtered_contacts = $derived(
		search_query
			? contacts.filter(c => c.name.toLowerCase().includes(search_query.toLowerCase()))
			: contacts
	);

	const letters = $derived(
		[...new Set(filtered_contacts.map(c => c.name.charAt(0)))].sort()
	);
</script>

<section class="container">
	<header class="app-window-drag-handle titlebar">
		<div class="search-bar">
			<input type="text" bind:value={search_query} placeholder="Search" />
		</div>
	</header>

	<div class="main">
		<aside class="contact-list">
			{#each letters as letter}
				<div class="letter-section">
					<div class="letter-header">{letter}</div>
					{#each filtered_contacts.filter(c => c.name.charAt(0) === letter) as contact, i}
						{@const index = contacts.indexOf(contact)}
						<button
							class="contact-item"
							class:active={selected === index}
							onclick={() => selected = index}
						>
							<div class="mini-avatar" style:background-color={contact.color}>
								{contact.avatar}
							</div>
							{contact.name}
						</button>
					{/each}
				</div>
			{/each}
		</aside>

		<div class="contact-detail">
			<div class="detail-header">
				<div class="detail-avatar" style:background-color={selected_contact.color}>
					{selected_contact.avatar}
				</div>
				<h2>{selected_contact.name}</h2>
				<p class="detail-company">{selected_contact.company}</p>
			</div>

			<div class="detail-fields">
				<div class="field-group">
					<span class="field-label">phone</span>
					<div class="field-value phone-link">{selected_contact.phone}</div>
				</div>
				<div class="field-group">
					<span class="field-label">email</span>
					<div class="field-value email-link">{selected_contact.email}</div>
				</div>
				<div class="field-group">
					<span class="field-label">address</span>
					<div class="field-value">{selected_contact.address}</div>
				</div>
			</div>

			<div class="detail-actions">
				<button class="action-btn">💬 Message</button>
				<button class="action-btn">📞 Call</button>
				<button class="action-btn">📹 FaceTime</button>
				<button class="action-btn">📧 Mail</button>
			</div>
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
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 8px 12px;
		min-height: 42px;
		background: linear-gradient(to bottom, #f6f6f6, #ededef);
		border-bottom: 1px solid #d1d1d6;

		:global(body.dark) & {
			background: linear-gradient(to bottom, #3a3a3c, #2c2c2e);
			border-bottom-color: #1c1c1e;
		}
	}

	.search-bar {
		width: 220px;

		input {
			width: 100%;
			padding: 5px 10px;
			border: none;
			border-radius: 6px;
			background: rgba(0, 0, 0, 0.06);
			font-size: 12px;
			color: var(--system-color-light-contrast);

			:global(body.dark) & {
				background: rgba(255, 255, 255, 0.08);
			}
		}
	}

	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.contact-list {
		width: 240px;
		min-width: 240px;
		border-right: 1px solid #d1d1d6;
		overflow-y: auto;
		background: #f2f2f7;

		:global(body.dark) & {
			background: #1c1c1e;
			border-right-color: #38383a;
		}
	}

	.letter-section {
		margin-bottom: 4px;
	}

	.letter-header {
		padding: 4px 16px;
		font-size: 12px;
		font-weight: 700;
		color: #86868b;
		background: rgba(0, 0, 0, 0.03);
		position: sticky;
		top: 0;

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.03);
		}
	}

	.contact-item {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 6px 16px;
		border: none;
		background: none;
		font-size: 14px;
		color: var(--system-color-light-contrast);
		cursor: pointer;
		text-align: left;

		&:hover {
			background: rgba(0, 0, 0, 0.04);
		}

		&.active {
			background: #007aff;
			color: white;
		}
	}

	.mini-avatar {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 9px;
		font-weight: 600;
		color: white;
		flex-shrink: 0;
	}

	.contact-detail {
		flex: 1;
		overflow-y: auto;
		padding: 24px;
	}

	.detail-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 24px;
	}

	.detail-avatar {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 28px;
		font-weight: 600;
		color: white;
		margin-bottom: 12px;
	}

	.detail-header h2 {
		font-size: 22px;
		font-weight: 600;
		margin: 0;
	}

	.detail-company {
		font-size: 14px;
		color: #86868b;
		margin: 4px 0 0;
	}

	.detail-fields {
		background: white;
		border-radius: 10px;
		overflow: hidden;
		margin-bottom: 16px;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

		:global(body.dark) & {
			background: #2c2c2e;
		}
	}

	.field-group {
		padding: 10px 16px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);

		&:last-child {
			border-bottom: none;
		}

		:global(body.dark) & {
			border-bottom-color: rgba(255, 255, 255, 0.04);
		}

		.field-label {
			font-size: 11px;
			color: #86868b;
			text-transform: lowercase;
			margin-bottom: 2px;
			display: block;
		}
	}

	.field-value {
		font-size: 14px;
	}

	.phone-link, .email-link {
		color: #007aff;
	}

	.detail-actions {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.action-btn {
		padding: 8px 16px;
		background: white;
		border: 1px solid #d1d1d6;
		border-radius: 8px;
		font-size: 13px;
		color: var(--system-color-light-contrast);
		cursor: pointer;

		&:hover {
			background: #f2f2f7;
		}

		:global(body.dark) & {
			background: #2c2c2e;
			border-color: #48484a;

			&:hover {
				background: #3a3a3c;
			}
		}
	}
</style>
