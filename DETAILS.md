Q: can you also give me a github actions job that will trigger this managed agent session? or should i start it in some other way?

A: Great question — this is about how to invoke the agent, not a config change, so no build needed here.

The recommended pattern is a GitHub Actions workflow that calls the Managed Agents API: create a session pointing at your already-created agent, send a user message with the commit context, then stream/poll events until the session goes idle.

Here's a ready-to-use workflow:

```yaml
# .github/workflows/trigger-qa-agent.yml
name: Trigger QA Autotest Generator

on:
  push:
    branches-ignore:
      - "qa/autotest-*" # ignore the agent's own test branches
      - main # avoid triggering on the agent's own fix commits if they land on main

jobs:
  generate-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger QA Agent session
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          AGENT_ID: ${{ secrets.QA_AGENT_ID }} # your agent's ID, e.g. agt_abc123
          ENVIRONMENT_ID: ${{ secrets.QA_ENVIRONMENT_ID }} # your environment ID, e.g. env_abc123
          VAULT_ID: ${{ secrets.QA_VAULT_ID }} # vault holding your GitHub MCP credential
        run: |
          # 1. Create a session
          SESSION=$(curl -sf https://api.anthropic.com/v1/sessions \
            -H "x-api-key: $ANTHROPIC_API_KEY" \
            -H "anthropic-version: 2023-06-01" \
            -H "anthropic-beta: managed-agents-2026-04-01" \
            -H "content-type: application/json" \
            -d '{
              "agent": "'"$AGENT_ID"'",
              "environment_id": "'"$ENVIRONMENT_ID"'",
              "vault_ids": ["'"$VAULT_ID"'"],
              "title": "QA gen: ${{ github.sha }}"
            }')
          SESSION_ID=$(echo "$SESSION" | jq -r '.id')
          echo "Session: $SESSION_ID"

          # 2. Send the triggering commit as the first user message
          curl -sf "https://api.anthropic.com/v1/sessions/$SESSION_ID/events" \
            -H "x-api-key: $ANTHROPIC_API_KEY" \
            -H "anthropic-version: 2023-06-01" \
            -H "anthropic-beta: managed-agents-2026-04-01" \
            -H "content-type: application/json" \
            -d '{
              "events": [{
                "type": "user.message",
                "content": [{
                  "type": "text",
                  "text": "Generate a Playwright test for this commit:\nRepo: ${{ github.repository }}\nCommit: ${{ github.sha }}\nBranch: ${{ github.ref_name }}\nMessage: ${{ github.event.head_commit.message }}"
                }]
              }]
            }'

          # 3. Poll until the session goes idle (agent finished its full workflow)
          echo "Polling for completion..."
          for i in $(seq 1 60); do
            sleep 30
            STATUS=$(curl -sf "https://api.anthropic.com/v1/sessions/$SESSION_ID" \
              -H "x-api-key: $ANTHROPIC_API_KEY" \
              -H "anthropic-version: 2023-06-01" \
              -H "anthropic-beta: managed-agents-2026-04-01" \
              | jq -r '.status')
            echo "[$i/60] status: $STATUS"
            if [ "$STATUS" = "idle" ] || [ "$STATUS" = "terminated" ]; then
              echo "Agent completed."
              break
            fi
          done

          # 4. Print the last agent message for the Actions log
          curl -sf "https://api.anthropic.com/v1/sessions/$SESSION_ID/events?limit=20" \
            -H "x-api-key: $ANTHROPIC_API_KEY" \
            -H "anthropic-version: 2023-06-01" \
            -H "anthropic-beta: managed-agents-2026-04-01" \
            | jq -r '.data[] | select(.type=="agent.message") | .content[].text' \
            | tail -5
```

Three secrets to add in your repo settings (Settings → Secrets → Actions):

| Secret            | Where to get it                                                           |
| ----------------- | ------------------------------------------------------------------------- |
| ANTHROPIC_API_KEY | Anthropic console                                                         |
| QA_AGENT_ID       | The id field shown after you save this agent config (e.g. agt\*…)         |
| QA_ENVIRONMENT_ID | The environment you set up in this builder                                |
| QA_VAULT_ID       | The vault ID holding your GitHub MCP credential (shown in the vault step) |

One important detail: you'll want to exclude the agent's own feature branches from this trigger, otherwise the agent pushing a fix commit re-triggers itself. The branches-ignore filter above handles that if you land the generated tests on a separate branch — you may want to tighten it further (e.g. ignore: ['qa/autotest-*']) to match whatever branch naming convention your agent uses.

Want me to add the branch naming convention to the system prompt so it's consistent with the workflow filter?
