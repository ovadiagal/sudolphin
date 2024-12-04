# Sudolphin Project Report

### Team 1 - Gal Ovadia, Rana Myneni, Timothy Copeland, Jacob Kotzian, Matthew Perry, Mae Frank

## Introduction/Background (10 points)

- Provide an in-depth overview of Project 2's objectives and the chosen technology stack.
- Offer an overview of the project's context and significance.
- Define the project scope and your project management approach.
- Discuss related work and how your project aligns with or diverges from existing solutions or methodologies.

The project is an AI-driven educational platform where users can upload their academic materials such as lecture slides, practice exams, homework assignments, syllabi, etc.
Utilizing OpenAI's API, the platform processes the uploaded materials to generate customized study aids, including flashcards, practice questions, quizzes, and concise summary sheets (crib sheets).
This platform aims to enhance user learning experience by providing personalized and adaptive study resources.

### Related Work

Many platform exist allowing the generation of specific educational resources such as flashcards (Revisely, Memrizz, Anki plugins, etc), quizzes (Quizgecko, Quizlet, Jotform, etc), and summary sheets (Mymap, Summarizer, etc).
However, few of these allow generation of all these resources in one place or the ability to manage files.
Good AI generation requires a lot of context, which is why course material management (file upload, course creation, etc) is a key feature of our platform.


## Software Technologies (15 points)

- Detail the technologies, frameworks, and AI tools used, including any crucial libraries or frameworks.
- Discuss the rationale for selecting specific AI tools and design patterns.

### Frontend & Backend Tech Stacks

**Framework**: Next.js

Next.js is a powerful React framework that supports both frontend and backend development through its server-side rendering and API routes capabilities.
This unified approach simplifies development, ensures consistency across the application, and enhances performance and SEO.

**Language**: TypeScript

TypeScript provides static typing, which helps catch errors during development, improves code maintainability, and enhances collaboration among developers.

**Styling**: Tailwind CSS 

Tailwind CSS offers utility-first CSS for rapid UI development, while Styled Components allow for modular and scoped styling within components.

**Backend Services**: Supabase

Supabase provides a comprehensive suite of backend services, including authentication, database management, and file storage.
Its seamless integration with Next.js and TypeScript makes it an ideal choice for us.

**Backend Services**: Supabase Auth

Supabase Auth provides secure user sign-up, login, and session management.

**Database**: Supabase PostgreSQL

PostgreSQL is a powerful, open-source relational database system that integrates smoothly with Supabase, offering robust data management capabilities.

### AI Tools

OpenAI's API:

Justification: OpenAI’s API will be used to generate study materials such as flashcards, practice tests, problems, and crib sheets based on user-uploaded content.

GitHub Copilot: 

Justification: Copilot proved extremely powerful in the implementation stage for Project 1. Having the option to simply autocomplete lines instead of having to prompt an LLM, which may be few-shot, sped up the development process significantly, and we expect that Copilot will be similarly effective while coding for Project 2. 

ChatGPT:

Justification: ChatGPT was very productive in Project 1 when assisting with tasks that were more involved. It significantly helped decrease the time needed for debugging, as this is a situation that requires additional context, and could generate boilerplate code and unit tests in seconds with just one-shot.

Cursor:

Justification: Cursor was a standout tool during the development of Project 1 because of its context awareness and its capability to query our codebase. We look forward to continuing to use Cursor in project 2.

Windsurf:

TODO: Add Windsurf Justification

## Requirements (20 Points)

- Document both Functional and Non-Functional Requirements.
- Make sure to mention the 4 MMFs in detail here.
- Discuss the process of identifying and prioritizing these requirements.

### Minimum Marketable Features (MMFs)

1. Create and delete classes:
Users can create and delete classes they are enrolled in

2. Educational material upload:
Users can upload and delete their educational materials in PDF format

3. AI-Generated study resources:
Users can generate personalized study aids from uploaded materials.

4. Mastery statistics:
A centralized hub for users to interact with and manage their study materials.

5. Sharing:
Users can natively export the generated materials via iMessage, Airdrop, etc.


### Functional Requirements

### Non-Functional Requirements

- App must work for all modern browser engines (Chromium, Firefox, Webkit)

### Requirement Priority



## Design (30 Points)

- Present architectural design diagrams.
- Explain your design decisions and their impact.


![Example Image](chatuml-diagram.png)


## Design Patterns Implementation (30 points)

### Factory Method

The Supabase client configuration is setup once in a factory method, client code call methods of this created object.
This ensures consistent instantiation of Supabase client across all calling classes, while being open to modification (secrets update) and the ability to have multiple instances of the database (scalability for the future).

```typescript
export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
    ...
```

### Proxy

Next.js's architecture uses a middleware to protect routes from unauthorized access.
This middleware works by redirecting unauthorized requests for protected routes or resources to the login page.
We used this to protect and isolate the dashboard and course pages from unauthorized access, while abstracting the authentication logic from the client-side code.

```typescript
export async function middleware(request: NextRequest) {
 return await updateSession(request);
}

export const updateSession = async (request: NextRequest) => {
   ...
   if (request.nextUrl.pathname.startsWith("/protected") && user.error) {
     return NextResponse.redirect(new URL("/sign-in", request.url));
   }
   if (request.nextUrl.pathname === "/" && !user.error) {
     return NextResponse.redirect(new URL("/protected", request.url));
   }
   ...
```

### Command 

All of the database operations and frontend updates for the dashboard's course logic are encapsulated in command objects.
Each of the commands or actions is self-contained and can be executed independently, allowing for calls to be made from different parts of the application.

```typescript
export async function createClass(
  ...
}

export async function deleteClass(
  ...
}

export async function updateClassColor(
  ...
}
```


## Testing Strategy, Execution, and AI Tool Analysis (60 points)

- Elaborate on the Test Strategy, including whitebox and blackbox testing methods. List various tools used for testing and explain their purpose.
- Provide detailed test cases and their outcomes.
- Discuss the AI tools used in blackbox and whitebox testing.
- Offer a comparative analysis on the performance, usability, and impact of these tools on productivity and quality, including metrics and statistical evidence. (30 points)

### Test Strategy

#### Testing Process

Whitebox unit testing will be performed for specific tasks, such as database requests, to ensure functionality not visible to the end-user.
Blackbox testing, such as form input and page navigation, will be performed to ensure functionality and correct presentation to the end-user on the frontend.
Since the front-end testing with blackbox testing navigates over multiple pages, this performs integration testing (multiple backend features).
Both of the tools discussed in section 1.2 can be generated with GPT models, for this analysis, ChatGPT 4o and O1 preview and Claude were used in both cases.
This allowed comparisons to be made between the performance of AI in black-box versus white-box.
For the most case, ChatGPT 4o was used initially, then Claude if the formatting was preferred, and then finally O1, if the other models were having issues.

#### Testing Tools

Jest is used for the main TypeScript logic testing.
This mocks components and validates correct data communication between modules. Front-end blackbox testing was performed with Playwright.
Playwright allows functions such as page navigation, form input, and button clicks.
These functions are used in tests to validate both the major functionality (ability to login, add courses, and upload documents) as well the presentation to the user (correct titles, correct button layout).
Playwright uses different engines for all test cases to validate functionality on different browsers (in our case, Firefox, Chromium, and WebKit).
We did not utilize the mobile testing features, to reduce the time for each test suite run.

### Overview of AI Tool Impact

Using AI tools has greatly streamlined our ability to write and implement test cases.
By turning requirements which we can describe in free-form text into accurate and robust test cases, AI simplifies creating tests that ensure effectiveness, efficiency, and quality.
It helps us handle complex tasks like dynamic selectors, parallel execution, and debugging, saving time and reducing errors.

Integrating AI in our testing also helped us configure CI/CD testing workflows (GitHub Actions) to further automate the process and ensure that code only gets merged into the main branch if it satisfies a baseline quality.
AI helped us set up the testing infrastructure, including the yaml and config files necessary to enable parallel execution and execution across multiple web platforms, making our testing more applicable to a wider range of platforms and end users.
Debugging is also easier, as AI provides actionable insights and suggests fixes.
Together, Playwright and AI tools make testing faster, more reliable, and easier to maintain.

### Comparative Analysis

|          Metric          |                                               Traditional Method                                              |                                             AI-Enhanced Method                                             |                                                                    Difference                                                                    |                                                                           Notes                                                                          |
|:------------------------:|:-------------------------------------------------------------------------------------------------------------:|:----------------------------------------------------------------------------------------------------------:|:------------------------------------------------------------------------------------------------------------------------------------------------:|:--------------------------------------------------------------------------------------------------------------------------------------------------------:|
| Development Time         | High– requiring manual scripting and redundant code.	                                                          | Low–- aid from LLMs like ChatGPT quickly generated initial test cases and scripts, reducing manual effort.	 | AI reduces the time spent on writing and refining test cases by automating repetitive tasks and providing actionable suggestions.	                | For both black-box and white-box testing, AI accelerates script creation while maintaining accuracy.                                                     |
| Defects Detected         | Moderate—depends on tester expertise; prone to missing edge cases or non-obvious bugs.                        | High—AI suggests additional test scenarios, including rare or edge cases, improving defect detection.	      | AI improves defect detection by identifying patterns and generating diverse scenarios, particularly for edge cases often missed in manual tests. | Black-box testing benefits most, as AI tools can simulate user behavior comprehensively.                                                                 |
| Test Coverage            | Limited—requires significant manual effort to ensure broad coverage across browsers, devices, and edge cases. | Extensive—AI automates multi-environment testing, increasing coverage effortlessly.                        | AI enables broader coverage by suggesting tests for multiple environments and scenarios, often beyond what traditional methods achieve.          | Tools like Playwright, combined with AI, enhance black-box testing coverage by automating cross-browser and device-specific scenarios.                   |
| Quality of Edge Cases    | Varies—dependent on tester skill and domain knowledge; edge cases may be overlooked.                          | High—AI proactively generates edge case scenarios based on application behavior and context.               | AI ensures high-quality edge case testing by covering unexpected scenarios, reducing the risk of critical bugs.                                  | Especially impactful for white-box testing, where AI can analyze code paths to identify less obvious cases.                                              |
| Ease of Test Maintenance | Low—manual updates required when code or UI changes, making maintenance time-consuming.                       | High—AI suggests adaptive test modifications and optimizations to align with code or UI changes.           | AI reduces maintenance effort by identifying changes and proposing updates, minimizing the risk of outdated test scripts.	                        | Black-box tests benefit from AI's ability to handle dynamic selectors and adapt to UI changes, while white-box tests gain from optimized logic coverage. |


## Challenges and Innovations (15 points)

- Detail challenges faced during the project and the innovative solutions implemented. This could be related to adoption of AI tools, testing technologies, or other aspects.
- Highlight unique technological or methodological approaches that distinguished your project.

One challenge we faced was in black-box testing, where our end-to-end tests were not idempotent due the database not being reset between tests.
This caused tests to fail when run in parallel, as the interaction order with the database was not guaranteed.
To solve this, we forced GitHub Actions to run the tests sequentially, and only have a single test runner at a time.
A better solution would be to create a new small database for each test.
Another challenge was ensuring that the all uploaded and generated file persist on the page.
To solve this, we created a Supabase table that stored this information, and fetched it on page load.
Another challenge was ensuring generated course materials were in the correct format (i.e. flashcard vs quiz).
We solved this by using prompts that defined a detailed structure for the output, as opposed to only asking only for a format.


## Project Outcomes and Evaluation (10 points)

- Summarize the final outputs, emphasizing the effectiveness/non-effectiveness of AI tools in achieving project goals.
- Critically assess the project outcomes relative to the initial objectives and provide a quantitative and qualitative evaluation.

## Future Directions (10 points)

- Suggest potential enhancements or future research opportunities based on your findings.
- Discuss possible improvements to AI tool usage or alternative tools that could be explored.
