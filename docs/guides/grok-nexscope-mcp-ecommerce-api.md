---
learning_topic: agents
content_kind: guide
layout: default
title: "Grok MCP Setup: Connect Nexscope and Check Your First Tool"
description: "Add the Nexscope MCP server in Grok, complete authentication, check tool discovery with a copyable prompt, and plan a one-request ecommerce lookup."
permalink: /guides/grok-nexscope-mcp-ecommerce-api/
date_published: 2026-11-09
date_modified: 2026-11-10
last_modified_at: 2026-11-10
last_reviewed: 2026-11-10
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
related_topics: [research]
compact_evidence: true
evidence_scope: "Setup follows official Grok and Nexscope documentation. Authenticated Grok execution remains to be verified."
next_step:
  id: grok_nexscope_mcp
  intent: mcp-setup
  title: Check the Nexscope MCP connection details
  description: "Open the official endpoint, transport and authentication instructions while you configure Grok."
  label: Open Nexscope MCP Setup Guide
  url: https://www.nexscope.ai/mcp-map?co-from=learn
---

# Connect Grok to Nexscope MCP and check your first tool

In Grok, choose **New Connector → Custom** and enter `https://api.nexscope.ai/mcp`. If Grok asks for a transport, choose **Streamable HTTP**. Complete authentication, then check whether Grok can see the tool you need. For Business and Enterprise workspaces, xAI documents an admin provisioning step. [Grok connector documentation](https://docs.x.ai/grok/connectors) · [Nexscope MCP Guide](https://www.nexscope.ai/mcp-map)

{% include article-action.html placement="article-top" %}

## 1. Add and authenticate the connector

1. Open [Grok Connectors](https://grok.com/connectors) and select **New Connector → Custom**.
2. Paste the server URL and follow the authentication flow offered by your Grok account. If it requests a Nexscope key, use the designated credential field. Nexscope documents bearer authentication as `Authorization: Bearer YOUR_API_KEY`.
3. Save the connector and open a conversation with access to it.

## 2. Check whether Grok can see a Nexscope tool

Paste this prompt into the conversation:

> Inspect the tools available through my Nexscope connector. Tell me whether `nexscope_chuhaijiang_tiktok_video_search` is available. If it is, show its required inputs from the tool schema. Stop after discovery and wait for me before running a lookup.

Look for the tool in the connector's tool list or activity if your interface shows it. Compare the name and schema against the Nexscope reference. A chat answer that repeats a name from your prompt is insufficient to verify discovery. [TikTok Video Keyword Search tool reference](https://www.nexscope.ai/api-docs/chuhaijiang-tiktok-video-search?view=api&co-from=learn)

## 3. Run one lookup after reviewing the cost

After confirming discovery, ask Grok to prepare one lookup with `country` set to `us`, `keyword` set to `insulated travel mug`, `page` set to `1` and `pageSize` set to `3`. Review the arguments and the documented cost before authorizing the request. Grok access and Nexscope API usage are billed separately.

After the request, look for a visible tool call or a matching Nexscope usage record. Save the submitted arguments, request ID if present, and source video IDs or URLs. If the request fails, keep the error and resolve it before retrying. [Request reference and tester](https://www.nexscope.ai/api-docs/chuhaijiang-tiktok-video-search?view=playground&co-from=learn)

## What should you check if Grok cannot connect?

| Symptom | What to check |
| --- | --- |
| The Custom option is missing | Check whether your workspace admin needs to provision the connector. |
| Authentication fails | Check the sign-in flow or the configured credential and its access. |
| Grok names a tool but shows no activity | Inspect the connector's visible tools and check Nexscope usage for any attempted lookup. |
| The lookup returns an error | Check the operation schema, required parameters, account access and available credits before retrying. |

You can also collect data in the Playground and paste selected results into Grok. Developers building their own app can use xAI function calling and execute approved Nexscope REST requests from their backend. [xAI function calling](https://docs.x.ai/developers/tools/function-calling)

Continue with the [TikTok buyer-question guide]({{ '/guides/grok-nexscope-tiktok-research/' | relative_url }}) or the [product image and video workflow]({{ '/guides/grok-nexscope-creative-workflow/' | relative_url }}).
