# 🏷️ GenCodeBarres v2.3 - Générateur de Planches d'Étiquettes

## 🚀 Introduction

**GenCodeBarres v2.3** est une application web conçue pour la production rapide et en masse de codes-barres et de QR Codes, organisés en planches d'étiquettes prêtes à être imprimées. Cet outil est idéal pour les inventaires, la gestion des actifs, ou l'étiquetage de produits nécessitant des configurations de grille précises (marges, hauteur, colonnes).

La fonctionnalité principale de cet onglet est l'importation de listes de codes via un fichier **Excel (.xlsx)** pour générer des planches en **série**.

## ✨ Fonctionnalités Clés

* **Importation en Lot** : Importation de codes à partir de la **colonne A** d'un fichier Excel (.xlsx).
* **Types de Codes Pris en Charge** :
    * Code 128 (Standard pour la plupart des usages).
    * EAN-13 (avec calcul automatique du chiffre de contrôle pour les produits).
    * QR Code (pour liens ou informations détaillées).
* **Configuration de Grille Avancée** :
    * Prise en charge de **Presets** de planches d'étiquettes courantes (ex: 3x8, 4x10).
    * Contrôle précis des **Marges** (Haut et Gauche en `mm`).
    * Définition du nombre de **Colonnes** et de **Lignes**.
    * Ajustement de la **Hauteur d'Étiquette** (`mm`) et de l'**Échelle du Code**.
* **Fonctionnalité d'Orientation** : Option d'ajouter une flèche latérale (Haut ou Bas) pour faciliter l'orientation du collage ou de la lecture.
* **Exportation** :
    * Aperçu en temps réel des planches.
    * Exportation **Multi-Pages** vers un fichier **PDF** optimisé (via `html2canvas` et `jsPDF`).
    * Impression directe via les médias d'impression CSS.

## 🛠️ Stack Technique

Ce projet est une application web statique (côté client) utilisant les technologies suivantes :

| Composant | Description | Librairie Utilisée |
| :--- | :--- | :--- |
| **Génération Code-barres** | Code 128, EAN-13 | `JsBarcode` |
| **Génération QR Code** | QR Code | `qrcode.js` |
| **Lecture Excel** | Importation de données en masse | `xlsx.js` (SheetJS) |
| **Exportation PDF** | Conversion du HTML/SVG/Canvas en PDF | `html2canvas` et `jspdf` |
| **UI/UX** | Thème sombre (Slate) et mise en page réactive. | HTML / CSS / JavaScript |

## 📦 Installation et Démarrage

Le projet est entièrement *client-side* et ne nécessite pas de serveur pour fonctionner :

1.  Téléchargez tous les fichiers sources (`index.html`, `plaquettes.js`, et `plaquettes.css`).
2.  Assurez-vous que les dépendances externes listées dans le HTML sont accessibles (CDN).
3.  Ouvrez le fichier HTML dans votre navigateur (`file:///.../nom_du_fichier.html`).

## ✍️ Guide d'Utilisation (Onglet Planches)

### 1. Préparation des Données

* Créez un fichier **Excel (.xlsx)**.
* Listez tous les codes (numériques ou alphanumériques) que vous souhaitez générer dans la **Colonne A** du fichier.
* Glissez-déposez le fichier sur la zone **"Import .xlsx"** ou cliquez pour le sélectionner. Le statut d'importation confirmera le nombre de codes chargés.

### 2. Configuration et Aperçu

1.  **Type de Code** : Choisissez le format de code (Code 128, EAN-13 ou QR Code).
2.  **Configuration Planches** :
    * Sélectionnez un **Modèle prédéfini** pour appliquer les dimensions d'une planche standard.
    * *OU* ajustez manuellement les dimensions (Marges, Colonnes, Lignes, Hauteur d'Étiquette) en millimètres (`mm`) pour correspondre à vos étiquettes vierges.
3.  **Visualisation** : L'aperçu est mis à jour en temps réel. Utilisez le curseur de **Zoom** pour vérifier l'alignement sans affecter le résultat de l'impression.

### 3. Impression et Exportation

Une fois la configuration validée dans l'aperçu :

* **Télécharger le PDF** : Lance la conversion de toutes les pages générées en un seul fichier PDF optimisé pour l'impression (idéal pour l'envoi à une imprimerie ou une impression différée).
* **Imprimer toutes les Planches** : Lance directement la boîte de dialogue d'impression de votre navigateur. Le CSS d'impression est conçu pour supprimer l'interface et les marges par défaut, garantissant une sortie fidèle aux dimensions définies.
