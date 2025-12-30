# Guide de démarrage rapide de l'API Gemini  |  Gemini API  |  Google AI for Developers

-   Sur cette page
-   [Avant de commencer](#before_you_begin)
-   [Installer le SDK Google GenAI](#install-gemini-library)
-   [Créer votre première demande](#make-first-request)
-   [Étape suivante](#what's-next)

 ![](https://ai.google.dev/_static/images/translated.svg?authuser=1&hl=fr) Cette page a été traduite par l'[API Cloud Translation](//cloud.google.com/translate/?authuser=1&hl=fr).

-   [Accueil](https://ai.google.dev/?authuser=1&%3Bhl=fr&hl=fr)
-   [Gemini API](https://ai.google.dev/gemini-api?authuser=1&%3Bhl=fr&hl=fr)
-   [Docs](https://ai.google.dev/gemini-api/docs?authuser=1&%3Bhl=fr&hl=fr)

Ce contenu vous a-t-il été utile ?

Envoyer des commentaires

# Guide de démarrage rapide de l'API Gemini

content\_copy

-   Sur cette page
-   [Avant de commencer](#before_you_begin)
-   [Installer le SDK Google GenAI](#install-gemini-library)
-   [Créer votre première demande](#make-first-request)
-   [Étape suivante](#what's-next)

Ce guide de démarrage rapide vous explique comment installer nos [bibliothèques](https://ai.google.dev/gemini-api/docs/libraries?authuser=1&hl=fr) et effectuer votre première requête à l'API Gemini.

## Avant de commencer

Vous avez besoin d'une clé API Gemini. Si vous n'en avez pas encore, vous pouvez [en obtenir une sans frais dans Google AI Studio](https://aistudio.google.com/app/apikey?authuser=1&hl=fr).

## Installer le SDK Google GenAI

[Python](#python)[JavaScript](#javascript)[Go](#go)[Java](#java)[C#](#c)[Apps Script](#apps-script) Plus

À l'aide de [Python 3.9 ou version ultérieure](https://www.python.org/downloads/), installez le [package `google-genai`](https://pypi.org/project/google-genai/) à l'aide de la [commande pip](https://packaging.python.org/en/latest/tutorials/installing-packages/) suivante :

```
pip install -q -U google-genai
```

À l'aide de [Node.js v18 ou version ultérieure](https://nodejs.org/en/download/package-manager), installez le [SDK Google Gen AI pour TypeScript et JavaScript](https://www.npmjs.com/package/@google/genai) à l'aide de la [commande npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) suivante :

```
npm install @google/genai
```

Installez [google.golang.org/genai](https://pkg.go.dev/google.golang.org/genai) dans le répertoire de votre module à l'aide de la [commande go get](https://go.dev/doc/code) :

```
go get google.golang.org/genai
```

Si vous utilisez Maven, vous pouvez installer [google-genai](https://github.com/googleapis/java-genai) en ajoutant les éléments suivants à vos dépendances :

```
<dependencies>
  <dependency>
    <groupId>com.google.genai</groupId>
    <artifactId>google-genai</artifactId>
    <version>1.0.0</version>
  </dependency>
</dependencies>
```

Installez [googleapis/go-genai](https://googleapis.github.io/dotnet-genai/) dans le répertoire de votre module à l'aide de la [commande dotnet add](https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-package-add).

```
dotnet add package Google.GenAI
```

1.  Pour créer un projet Apps Script, accédez à [script.new](https://script.google.com/u/0/home/projects/create?authuser=1&hl=fr).
2.  Cliquez sur **Projet sans titre**.
3.  Renommez le projet Apps Script **AI Studio**, puis cliquez sur **Renommer**.
4.  Définissez votre [clé API](https://developers.google.com/apps-script/guides/properties?authuser=1&hl=fr#manage_script_properties_manually).
    1.  À gauche, cliquez sur **Paramètres du projet** ![Icône des paramètres du projet](https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/settings/default/24px.svg).
    2.  Sous **Propriétés du script**, cliquez sur **Ajouter une propriété de script**.
    3.  Pour **Propriété**, saisissez le nom de la clé : `GEMINI_API_KEY`.
    4.  Dans le champ **Valeur**, saisissez la valeur de la clé API.
    5.  Cliquez sur **Enregistrer les propriétés du script**.
5.  Remplacez le contenu du fichier `Code.gs` par le code suivant :

## Créer votre première demande

Voici un exemple qui utilise la méthode [`generateContent`](https://ai.google.dev/api/generate-content?authuser=1&hl=fr#method:-models.generatecontent) pour envoyer une requête à l'API Gemini à l'aide du modèle Gemini 2.5 Flash.

Si vous [définissez votre clé API](https://ai.google.dev/gemini-api/docs/api-key?authuser=1&hl=fr#set-api-env-var) comme variable d'environnement `GEMINI_API_KEY`, elle sera automatiquement récupérée par le client lors de l'utilisation des [bibliothèques de l'API Gemini](https://ai.google.dev/gemini-api/docs/libraries?authuser=1&hl=fr). Sinon, vous devrez [transmettre votre clé API](https://ai.google.dev/gemini-api/docs/api-key?authuser=1&hl=fr#provide-api-key-explicitly) en tant qu'argument lors de l'initialisation du client.

Notez que tous les exemples de code de la documentation de l'API Gemini supposent que vous avez défini la variable d'environnement `GEMINI_API_KEY`.

[Python](#python)[JavaScript](#javascript)[Go](#go)[Java](#java)[C#](#c)[Apps Script](#apps-script)[REST](#rest) Plus

```
from google import genai

# The client gets the API key from the environment variable `GEMINI_API_KEY`.
client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash", contents="Explain how AI works in a few words"
)
print(response.text)
```

```
import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}

main();
```

```
package main

import (
    "context"
    "fmt"
    "log"
    "google.golang.org/genai"
)

func main() {
    ctx := context.Background()
    // The client gets the API key from the environment variable `GEMINI_API_KEY`.
    client, err := genai.NewClient(ctx, nil)
    if err != nil {
        log.Fatal(err)
    }

    result, err := client.Models.GenerateContent(
        ctx,
        "gemini-2.5-flash",
        genai.Text("Explain how AI works in a few words"),
        nil,
    )
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println(result.Text())
}
```

```
package com.example;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;

public class GenerateTextFromTextInput {
  public static void main(String[] args) {
    // The client gets the API key from the environment variable `GEMINI_API_KEY`.
    Client client = new Client();

    GenerateContentResponse response =
        client.models.generateContent(
            "gemini-2.5-flash",
            "Explain how AI works in a few words",
            null);

    System.out.println(response.text());
  }
}
```

```
using System.Threading.Tasks;
using Google.GenAI;
using Google.GenAI.Types;

public class GenerateContentSimpleText {
  public static async Task main() {
    // The client gets the API key from the environment variable `GEMINI_API_KEY`.
    var client = new Client();
    var response = await client.Models.GenerateContentAsync(
      model: "gemini-2.5-flash", contents: "Explain how AI works in a few words"
    );
    Console.WriteLine(response.Candidates[0].Content.Parts[0].Text);
  }
}
```

```
// See https://developers.google.com/apps-script/guides/properties
// for instructions on how to set the API key.
const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
function main() {
  const payload = {
    contents: [
      {
        parts: [
          { text: 'Explain how AI works in a few words' },
        ],
      },
    ],
  };

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  const options = {
    method: 'POST',
    contentType: 'application/json',
    headers: {
      'x-goog-api-key': apiKey,
    },
    payload: JSON.stringify(payload)
  };

  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response);
  const content = data['candidates'][0]['content']['parts'][0]['text'];
  console.log(content);
}
```

```
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "contents": [
      {
        "parts": [
          {
            "text": "Explain how AI works in a few words"
          }
        ]
      }
    ]
  }'
```

## Étape suivante

Maintenant que vous avez effectué votre première requête d'API, vous pouvez consulter les guides suivants qui montrent Gemini en action :

-   [Génération de texte](https://ai.google.dev/gemini-api/docs/text-generation?authuser=1&hl=fr)
-   [Génération d'images](https://ai.google.dev/gemini-api/docs/image-generation?authuser=1&hl=fr)
-   [Compréhension des images](https://ai.google.dev/gemini-api/docs/image-understanding?authuser=1&hl=fr)
-   [Raisonnement](https://ai.google.dev/gemini-api/docs/thinking?authuser=1&hl=fr)
-   [Appel de fonction](https://ai.google.dev/gemini-api/docs/function-calling?authuser=1&hl=fr)
-   [Contexte long](https://ai.google.dev/gemini-api/docs/long-context?authuser=1&hl=fr)
-   [Embeddings](https://ai.google.dev/gemini-api/docs/embeddings?authuser=1&hl=fr)

Ce contenu vous a-t-il été utile ?

Envoyer des commentaires

Sauf indication contraire, le contenu de cette page est régi par une licence [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/), et les échantillons de code sont régis par une licence [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0). Pour en savoir plus, consultez les [Règles du site Google Developers](https://developers.google.com/site-policies?authuser=1&hl=fr). Java est une marque déposée d'Oracle et/ou de ses sociétés affiliées.

Dernière mise à jour le 2025/12/18 (UTC).