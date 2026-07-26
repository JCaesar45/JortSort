# AURA // The Obsidian Vault

## Architectural Rationale & Methodological Choices

Look, the industry is drowning in bloated abstractions. Everyone is shipping megabytes of JavaScript to render a centered div, and backend architectures look like microservice spaghetti just to justify a DevOps team's existence. I built AURA to be the antithesis of that. It’s an exclusive digital asset vault, designed to feel like walking into a Swiss private bank, but engineered with the precision of a high-frequency trading desk. 

When I sat down to architect this, my primary thought process was rooted in *ruthless efficiency disguised as luxury*. The frontend needs to feel heavy, expensive, and fluid. The backend needs to handle concurrent, high-stakes requests without breaking a sweat. 

Here is how I broke down the methodology:

1.  **The Frontend Illusion (HTML/CSS/JS):** I didn't want standard CSS frameworks. They all look the same. I built a custom design system using modern CSS features like `@layer`, `@container`, and `@property` to create a glassmorphic, dark-mode interface that actually respects the DOM. For the JavaScript, instead of pulling in Three.js or a heavy physics engine for the background, I wrote a custom Canvas-based particle attraction system. It’s lightweight, runs at 60fps on a potato, and looks like liquid gold.
2.  **State Determinism (TypeScript):** React state management is usually a mess of prop drilling or overly complex Redux boilerplate. I opted for RxJS. It forces you to think in streams and handles asynchronous vault updates deterministically. It’s strictly typed, meaning if you break the data shape, the compiler screams at you before you even push the code.
3.  **The Concierge Engine (Python):** FastAPI is the only logical choice here. I needed async I/O for talking to external liquidity providers, and Pydantic V2 for data validation. It’s fast, it’s typed, and it doesn't get in the way. 
4.  **The Cryptographic Enclave (Java):** This is where the heavy lifting happens. I used Java 21 specifically for Virtual Threads (Project Loom). Historically, Java required reactive frameworks (like WebFlux) to handle massive concurrency, which makes the code unreadable. Virtual threads give us the throughput of reactive programming with the synchronous, readable code style of traditional Java. We handle AES-GCM encryption for the vault keys directly in this service.

### References

Pressler, R. (2023). *JEP 444: Virtual Threads*. OpenJDK. https://openjdk.org/jeps/444

Ramírez, S. (2023). *FastAPI Documentation*. FastAPI. https://fastapi.tiangolo.com/

Stam, J. (1999). Stable fluids. *Proceedings of the 26th annual conference on Computer graphics and interactive techniques*, 121-128. https://doi.org/10.1145/311535.311548

Suzanne, M. (2023). *CSS Containment Module Level 3*. W3C. https://www.w3.org/TR/css-contain-3/

***
