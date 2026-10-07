import Exam from "../models/Exam.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Progress from "../models/Progress.js";

// Helper to shuffle an array in-place
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Builds a question with randomized options and exact explanation
function createQuestion(id, question, correctOpt, distractors, explanation) {
  const options = shuffleArray([correctOpt, ...distractors]);
  const answerIndex = options.indexOf(correctOpt);
  return { id, question, options, answerIndex, explanation };
}

const QUESTION_BANK = {
  en: {
    "operating systems": [
      ["In an operating system, what is the primary cause of external fragmentation in contiguous memory allocation?", "Variable-sized memory partitions leaving non-contiguous small free holes", ["Fixed page frames of uniform size", "Internal page allocation round-offs", "TLB cache misses"], "External fragmentation arises when total memory space exists to satisfy a request, but it is not contiguous."],
      ["Which page replacement algorithm suffers from Belady's Anomaly?", "FIFO (First In First Out)", ["LRU (Least Recently Used)", "Optimal Page Replacement", "LFU (Least Frequently Used)"], "FIFO can experience more page faults even when the number of allocated frames increases (Belady's Anomaly)."],
      ["What are the four necessary and sufficient conditions for a deadlock to occur?", "Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait", ["Paging, Segmentation, Swapping, Thrashing", "Starvation, Priority Inversion, Aging, Mutex", "Deadlock Prevention, Avoidance, Detection, Recovery"], "All four Coffman conditions must hold simultaneously for a deadlock to happen."],
      ["What is the role of the Translation Lookaside Buffer (TLB)?", "An associative hardware cache for fast virtual-to-physical address translation", ["A secondary storage swapping mechanism", "A disk scheduling algorithm", "A process scheduling queue"], "TLB caches frequently accessed page-table entries to drastically reduce memory lookup times."],
      ["In CPU scheduling, which algorithm guarantees the minimum average waiting time for a given set of processes?", "SJF (Shortest Job First - non-preemptive / SRTF preemptive)", ["FCFS (First Come First Served)", "Round Robin with large time quantum", "Priority Scheduling without aging"], "Shortest Job First / Shortest Remaining Time First is provably optimal for minimizing average waiting time."],
      ["What is thrashing in virtual memory?", "When the CPU spends more time swapping pages in and out than executing instructions", ["Fast execution of parallel processes", "Cache hits exceeding 99%", "Direct memory access without CPU interference"], "Thrashing occurs when the system's working set exceeds physical memory, causing continuous page faults."],
      ["Which algorithm is used for deadlock avoidance in an operating system?", "Banker's Algorithm", ["Round Robin Algorithm", "Kruskal's Algorithm", "Dijkstra's Shortest Path"], "The Banker's Algorithm tests for safety by simulating the allocation of predetermined maximum possible amounts of all resources."],
      ["What is the primary difference between a binary semaphore and a mutex?", "A mutex has ownership (only the thread that locked it can unlock it), whereas a semaphore does not", ["Semaphores only work on single-core CPUs", "Mutexes allow negative integer counters", "Binary semaphores cannot prevent race conditions"], "A mutex has strict thread ownership semantics, while a binary semaphore is a signaling mechanism without ownership."],
      ["In the fork() system call in UNIX-like systems, what value is returned to the child process upon success?", "0", ["The child's PID", "1", "-1"], "fork() returns 0 to the newly created child process, the child's PID to the parent process, and -1 on error."],
      ["Which disk scheduling algorithm services requests closest to the current head position, potentially causing starvation for distant tracks?", "SSTF (Shortest Seek Time First)", ["FCFS (First Come First Served)", "SCAN (Elevator Algorithm)", "C-SCAN (Circular SCAN)"], "SSTF chooses the request with the least seek time from the current head position, which can starve requests at outer tracks."],
      ["What are the three critical requirements that any valid solution to the Critical Section problem must satisfy?", "Mutual Exclusion, Progress, Bounded Waiting", ["Atomicity, Consistency, Isolation", "Deadlock Avoidance, Detection, Recovery", "Preemption, Starvation, Aging"], "Dijkstra and subsequent researchers proved that Mutual Exclusion, Progress, and Bounded Waiting are required."],
      ["What is the purpose of the 'Dirty Bit' (Modified Bit) in a page table entry?", "Indicates whether the page has been modified since it was loaded into physical memory", ["Indicates if the page is currently in the L1 CPU cache", "Prevents unauthorized read access to the page", "Tracks how many times the page was accessed"], "If the dirty bit is unset, the page has not been written to, so the OS does not need to write it back to disk upon eviction."],
      ["What overhead is primarily associated with a process context switch?", "Saving and restoring CPU registers, flushing TLB, and updating memory maps", ["Compiling source code to assembly", "Executing disk defragmentation", "Sorting the ready queue alphabetically"], "Context switching involves switching hardware registers, updating page directory pointers, and cache/TLB invalidation."],
      ["Peterson's Algorithm is a classical software solution for mutual exclusion between how many processes?", "Exactly 2 processes", ["Any arbitrary number N of processes", "4 processes sharing memory", "1 single background process"], "Peterson's algorithm is restricted to two processes sharing two variables: an integer turn and a boolean array flag[2]."],
      ["What is demand paging in an operating system?", "Pages are brought into main memory only when an explicit reference is made to them", ["All process pages are loaded into RAM before execution begins", "Pages are permanently locked into secondary storage", "The CPU demands memory directly without using page tables"], "Demand paging avoids loading unused pages into physical RAM, reducing I/O and memory footprint."],
      ["In paging memory management, where does internal fragmentation occur?", "Within the last allocated page frame of a process", ["Between adjacent allocated memory partitions", "In the swap space on the hard drive", "Inside the translation lookaside buffer (TLB)"], "Internal fragmentation occurs when a process's memory footprint does not perfectly divide by page size, leaving unused bytes in the last frame."],
      ["What is a zombie process in UNIX/Linux?", "A process that has completed execution but still has an entry in the process table because its parent hasn't read its exit status", ["A process consuming 100% CPU in an infinite loop", "A process that cannot be killed by SIGKILL", "A thread that lost its parent thread"], "When a child finishes, its termination status remains in the process table until the parent invokes wait() or waitpid()."],
      ["In C-SCAN (Circular SCAN) disk scheduling, how does the disk head move?", "It moves in one direction servicing requests, and returns immediately to the beginning without servicing requests on the return trip", ["It services requests only at the exact center tracks", "It alternates randomly between track 0 and maximum track", "It moves back and forth reversing direction at each extreme"], "C-SCAN provides a more uniform waiting time by treating cylinders as a circular list, returning to the start without servicing on the return."],
    ],
    "computer networks": [
      ["Which protocol operates at the Transport layer to provide reliable, connection-oriented data transfer?", "TCP (Transmission Control Protocol)", ["UDP (User Datagram Protocol)", "IP (Internet Protocol)", "ICMP (Internet Control Message Protocol)"], "TCP provides reliable, sequenced, byte-stream transfer with congestion control and three-way handshake."],
      ["What is the size of an IPv4 address and an IPv6 address respectively?", "32 bits and 128 bits", ["16 bits and 64 bits", "64 bits and 128 bits", "32 bits and 64 bits"], "IPv4 uses 32-bit addresses (approx 4.3 billion), while IPv6 uses 128-bit addresses."],
      ["In the OSI reference model, at which layer does Ethernet framing and MAC addressing occur?", "Data Link Layer (Layer 2)", ["Network Layer (Layer 3)", "Physical Layer (Layer 1)", "Transport Layer (Layer 4)"], "MAC addressing and frame encapsulation are standard functions of the Data Link Layer."],
      ["Which mechanism is used by TCP to handle network congestion?", "Slow Start, Congestion Avoidance, Fast Retransmit, Fast Recovery", ["Bellman-Ford distance vectoring", "Stop-and-Wait single bit ACK", "Token Ring token passing"], "TCP dynamically modulates its Congestion Window (cwnd) using Slow Start and additive-increase multiplicative-decrease."],
      ["Which routing protocol is based on the Link State routing algorithm (Dijkstra's Shortest Path)?", "OSPF (Open Shortest Path First)", ["RIP (Routing Information Protocol)", "BGP (Border Gateway Protocol)", "EGP (Exterior Gateway Protocol)"], "OSPF uses Dijkstra's algorithm to compute the shortest path tree from link-state advertisements."],
      ["What is the purpose of the Address Resolution Protocol (ARP)?", "Resolves an IPv4 address to a physical MAC address on a local link", ["Translates domain names to IP addresses", "Assigns dynamic IP addresses to hosts", "Encrypts packets at the network layer"], "ARP queries the local broadcast domain to obtain the hardware MAC address corresponding to a target IP."],
      ["What is the standard port number for HTTPS (Secure HTTP)?", "443", ["80", "8080", "22"], "HTTPS runs over TLS/SSL on default TCP port 443, while HTTP runs on port 80."],
      ["In TCP's Three-Way Handshake, what sequence of flags is exchanged between client and server?", "SYN -> SYN-ACK -> ACK", ["ACK -> SYN -> FIN", "SYN -> ACK -> DATA", "RST -> SYN -> ACK"], "The client sends SYN, the server replies with SYN-ACK, and the client confirms with ACK."],
      ["In a /24 IPv4 network, how many usable host IP addresses are available?", "254", ["256", "255", "128"], "A /24 subnet provides 2^(32-24) = 256 addresses; subtracting the network address and broadcast address leaves 254 usable hosts."],
      ["Which sliding window flow control protocol allows the sender to transmit N frames without receiving an ACK, but retransmits only the erroneous frame?", "Selective Repeat ARQ", ["Go-Back-N ARQ", "Stop-and-Wait ARQ", "Aloha"], "Selective Repeat retransmits only damaged or timed-out frames, whereas Go-Back-N retransmits all frames from the lost one onwards."],
      ["What is the primary role of the Border Gateway Protocol (BGP)?", "An exterior gateway protocol used for routing between autonomous systems (AS) on the Internet", ["An interior routing protocol for local LAN subnets", "A protocol to encrypt passwords in routers", "A protocol to resolve hostnames to IP addresses"], "BGP is the path-vector protocol that manages packet routing across different Internet Autonomous Systems."],
      ["What happens when the Time to Live (TTL) field of an IP packet decrements to zero?", "The packet is dropped and an ICMP Time Exceeded message is sent back to the sender", ["The packet is duplicated to all interfaces", "The packet is stored in router RAM permanently", "The packet is accelerated to priority queue"], "TTL prevents packets from circulating endlessly in routing loops; dropping it and sending ICMP Time Exceeded enables traceroute."],
      ["Which protocol translates human-readable domain names (like prepcycle.com) into numerical IP addresses?", "DNS (Domain Name System)", ["DHCP (Dynamic Host Configuration Protocol)", "SNMP (Simple Network Management Protocol)", "FTP (File Transfer Protocol)"], "DNS is the distributed naming system that resolves domain names to IP addresses (A/AAAA records)."],
      ["In Ethernet CSMA/CD, what is the purpose of the Binary Exponential Backoff algorithm?", "To resolve packet collisions on shared media by having stations wait a random time that doubles with each retry", ["To compress packet headers during transmission", "To calculate the checksum for CRC error detection", "To assign IP addresses dynamically to hosts"], "Binary exponential backoff exponentially increases the contention window after consecutive collisions to prevent repeated clashes."],
      ["Which Transport layer protocol is connectionless and does not guarantee delivery, order, or duplication protection?", "UDP (User Datagram Protocol)", ["TCP", "SCTP", "TLS"], "UDP sends independent datagrams without establishing a connection, making it lightweight and suitable for streaming and DNS."],
      ["What is the Maximum Transmission Unit (MTU) of a standard Ethernet frame?", "1500 bytes", ["512 bytes", "4096 bytes", "65535 bytes"], "Standard Ethernet v2 payload MTU is 1500 bytes; packets larger than this must be fragmented at the IP layer."],
    ],
    "theory of computation": [
      ["Which class of languages is recognized by a Deterministic Finite Automaton (DFA)?", "Regular Languages", ["Context-Free Languages only", "Context-Sensitive Languages only", "Recursively Enumerable Languages"], "DFA and NFA recognize precisely the regular languages (Type 3 in the Chomsky hierarchy)."],
      ["Can every Non-deterministic Finite Automaton (NFA) be converted into an equivalent DFA?", "Yes, through the Powerset (Subset) Construction", ["No, NFAs are strictly more powerful", "Only if the language is finite", "Only if it has no loops"], "Every NFA with n states has an equivalent DFA with at most 2^n states via subset construction."],
      ["Which computational model is strictly equivalent in power to a Pushdown Automaton (PDA)?", "Context-Free Grammars (CFGs)", ["Regular Expressions", "Linear Bounded Automata", "Turing Machines"], "PDAs and Context-Free Grammars both recognize and generate Context-Free Languages."],
      ["The Halting Problem for Turing machines is:", "Undecidable", ["Decidable in linear time", "Decidable in polynomial time", "Partially decidable with finite tapes"], "Turing's Halting Problem is the classic undecidable problem (no general algorithm exists for all inputs)."],
      ["Which operation does NOT preserve regularity of regular languages?", "None (Regular languages are closed under union, intersection, complement, concatenation, and star)", ["Union only", "Concatenation only", "Kleene star only"], "Regular languages are closed under all standard operations: union, intersection, complement, concatenation, Kleene star."],
      ["The Pumping Lemma for regular languages is primarily used to:", "Prove that a specific language is NOT regular", ["Prove that a language is regular", "Construct a minimal DFA", "Convert an NFA into a regular expression"], "The Pumping Lemma is a necessary condition for regularity; satisfying it does not prove regularity, but violating it disproves regularity."],
      ["Are Context-Free Languages (CFLs) closed under intersection and complementation?", "No, CFLs are NOT closed under intersection or complementation", ["Yes, CFLs are closed under all Boolean operations", "Closed under intersection but not complement", "Closed under complement but not intersection"], "L1 = {a^n b^n c^m} and L2 = {a^m b^n c^n} are both CFLs, but their intersection {a^n b^n c^n} is context-sensitive."],
      ["Which parsing problem determines whether a grammar can generate a string in more than one distinct parse tree?", "Grammar Ambiguity", ["Grammar Decidability", "Linear Boundedness", "Chomsky Normalization"], "An ambiguous grammar produces more than one leftmost derivation or distinct parse tree for at least one string in the language."],
      ["What is the maximum number of states in a minimal DFA equivalent to an NFA with 'n' states?", "2^n", ["n^2", "n!", "2n"], "In the worst case (e.g. searching for the nth symbol from the end), the powerset construction produces up to 2^n states."],
      ["According to Rice's Theorem, any non-trivial semantic property of the language recognized by a Turing machine is:", "Undecidable", ["Decidable in polynomial time", "Decidable in exponential time", "Context-Free"], "Rice's Theorem proves that any non-trivial semantic behavior of Turing machine languages is undecidable."],
      ["Which machine model recognizes Context-Sensitive Languages (Chomsky Type 1)?", "Linear Bounded Automaton (LBA)", ["Deterministic Finite Automaton (DFA)", "Pushdown Automaton (PDA)", "Unrestricted Turing Machine"], "LBAs are non-deterministic Turing machines with a tape bounded by a linear function of the input length."],
      ["What is the Post Correspondence Problem (PCP)?", "An undecidable decision problem involving finding matching sequences of tiles/strings", ["A polynomial-time sorting problem", "A graph coloring algorithm", "A regular expression minimization test"], "Emil Post proved in 1946 that the Post Correspondence Problem is undecidable over alphabets with at least two symbols."],
      ["Is the language L = {w w | w in {0, 1}*} regular, context-free, or context-sensitive?", "Context-Sensitive (not Context-Free)", ["Regular", "Context-Free", "Recursively Enumerable only"], "The duplication language {w w} requires remembering arbitrary history without a stack's LIFO constraint, making it context-sensitive."],
      ["In Chomsky Normal Form (CNF), all production rules must be of what form?", "A -> BC or A -> a (where A, B, C are non-terminals and a is a terminal)", ["A -> aB or A -> a", "A -> alpha B beta", "alpha -> beta where |alpha| <= |beta|"], "CNF restricts productions to two non-terminals or a single terminal, which enables CYK parsing in O(n^3) time."],
      ["Is the emptiness problem for Regular Languages decidable?", "Yes, decidable by checking reachability of an accept state from the start state in a DFA", ["No, undecidable for all automata", "Decidable only for 1-state NFAs", "Undecidable by Rice's Theorem"], "In a DFA, graph reachability algorithms (BFS/DFS) decide in linear time O(V + E) if an accept state is reachable from the start."],
    ],
    "algorithms": [
      ["What is the worst-case time complexity of QuickSort?", "O(n^2)", ["O(n log n)", "O(n)", "O(log n)"], "Worst case occurs when the chosen pivot is consistently the smallest or largest element, leading to O(n^2)."],
      ["Which algorithm finds the shortest paths from a single source vertex to all other vertices in a weighted graph with non-negative edge weights?", "Dijkstra's Algorithm", ["Kruskal's Algorithm", "Floyd-Warshall Algorithm", "Prim's Algorithm"], "Dijkstra's algorithm greedily extracts the minimum-distance vertex in O((V + E) log V) with a binary heap."],
      ["What is the primary condition required for applying Dynamic Programming?", "Optimal Substructure and Overlapping Subproblems", ["Greedy choice property alone", "Divide and conquer with independent subproblems", "Randomized pivot selection"], "Dynamic programming solves problems having optimal substructure combined with overlapping subproblems."],
      ["What is the time complexity of searching for an element in a balanced Binary Search Tree (AVL/Red-Black)?", "O(log n)", ["O(n)", "O(1)", "O(n log n)"], "Because height is balanced to O(log n), search, insert, and delete operations take O(log n) time."],
      ["Which sorting algorithm is stable and has an O(n log n) worst-case time complexity?", "Merge Sort", ["QuickSort", "HeapSort", "Selection Sort"], "Merge Sort maintains relative order of equal elements (stable) and always runs in O(n log n) time."],
      ["Which shortest path algorithm can handle graphs with negative edge weights and detect negative cycles?", "Bellman-Ford Algorithm", ["Dijkstra's Algorithm", "Breadth First Search (BFS)", "Prim's Algorithm"], "Bellman-Ford relaxes all edges |V| - 1 times, detecting negative weight cycles on the |V|th relaxation."],
      ["What is the time complexity of finding the Minimum Spanning Tree of a connected graph using Kruskal's algorithm?", "O(E log E) or O(E log V)", ["O(V^3)", "O(V + E)", "O(E^2)"], "Sorting E edges takes O(E log E); union-find operations with path compression take nearly linear time alpha(V)."],
      ["According to the Master Theorem, what is the asymptotic solution of T(n) = 2T(n/2) + O(n)?", "Theta(n log n)", ["Theta(n)", "Theta(n^2)", "Theta(log n)"], "Here a = 2, b = 2, log_b(a) = 1, and f(n) = O(n^1). By Case 2 of Master Theorem, T(n) = Theta(n log n)."],
      ["What is the time complexity of building a Binary Heap of n elements using the bottom-up Heapify method?", "O(n)", ["O(n log n)", "O(log n)", "O(n^2)"], "Bottom-up heap construction sums the heights of nodes, converging to a sum of n * sum(i / 2^i) = O(n)."],
      ["In the 0/1 Knapsack Problem with n items and capacity W, why is dynamic programming called pseudo-polynomial?", "Because the running time is O(n * W), which is polynomial in numeric value W but exponential in the length of W's binary representation", ["Because it only works for integer weights", "Because it is an approximation algorithm", "Because it relies on non-deterministic Turing steps"], "W requires log(W) bits to write down, so O(n * W) = O(n * 2^k) where k is input bit length."],
      ["Which graph traversal algorithm finds the shortest path in an unweighted graph?", "Breadth First Search (BFS)", ["Depth First Search (DFS)", "Topological Sort", "Preorder Traversal"], "BFS visits vertices level by level, ensuring that the first time a vertex is reached corresponds to the minimum number of edges."],
      ["What data structure is used to implement Kruskal's algorithm efficiently to prevent cycles?", "Disjoint Set Union (Union-Find) with path compression", ["Min-Heap priority queue", "Adjacency Matrix", "Binary Search Tree"], "Union-Find maintains connected components and detects whether adding an edge creates a cycle in nearly O(1) amortized time."],
      ["What is the time complexity of the Floyd-Warshall all-pairs shortest path algorithm?", "O(V^3)", ["O(V^2 log V)", "O(V * E)", "O(E^2)"], "Floyd-Warshall iterates over all intermediate vertices k, source vertices i, and destinations j using three nested loops: O(V^3)."],
      ["In Huffman Coding, what type of optimal code is generated for lossless data compression?", "Prefix-free variable-length code", ["Fixed-length block code", "Run-length encoded code", "Cyclic redundancy code"], "In a prefix-free code, no code word is a prefix of any other code word, enabling instantaneous unambiguous decoding."],
      ["What is the worst-case number of comparisons in Binary Search on a sorted array of size n?", "floor(log2(n)) + 1", ["n", "n / 2", "log10(n)"], "Each comparison halves the search space, yielding at most floor(log2(n)) + 1 comparisons before the element or failure is found."],
    ],
    "data structures": [
      ["Which data structure adheres strictly to the Last-In First-Out (LIFO) principle?", "Stack", ["Queue", "Array", "Linked List"], "A stack allows insertions (push) and deletions (pop) only at the top element (LIFO)."],
      ["In a circular queue implemented using an array of size N, what condition indicates that the queue is completely full?", "(rear + 1) % N == front", ["rear == front", "rear == N - 1", "front == -1"], "A circular queue leaves one slot empty to distinguish between empty (front == rear) and full ((rear + 1) % N == front)."],
      ["What is the worst-case time complexity of searching for an element in an unsorted Singly Linked List of n nodes?", "O(n)", ["O(1)", "O(log n)", "O(n^2)"], "Without indexing or ordering, every node from head to tail must be inspected in sequence."],
      ["What is the inorder traversal of a Binary Search Tree (BST)?", "Always produces keys in sorted ascending order", ["Always produces keys in sorted descending order", "Traverses root first then left child", "Produces keys in random order"], "Inorder traversal visits Left subtree -> Root -> Right subtree, which visits BST keys in monotonically non-decreasing order."],
      ["What is the maximum number of nodes in a binary tree of height h (where height of root is 0)?", "2^(h + 1) - 1", ["2^h", "2^(h - 1)", "h^2"], "A full binary tree has 2^0 + 2^1 + ... + 2^h = 2^(h + 1) - 1 total nodes."],
      ["In a Min-Heap, where is the minimum element always located?", "At the root (index 0 or 1)", ["At the leftmost leaf", "At the rightmost leaf", "At index floor(n / 2)"], "The heap-order property guarantees that every parent is less than or equal to its children, placing the minimum at the root."],
      ["What collision resolution technique stores all elements hashing to the same bucket in a linked list?", "Separate Chaining", ["Linear Probing", "Quadratic Probing", "Double Hashing"], "Separate chaining maintains a linked list (or tree) of colliding key-value pairs at each hash table bucket index."],
      ["What is the balance factor of a node in an AVL Tree?", "Height of Left Subtree - Height of Right Subtree", ["Number of left children - Number of right children", "Depth of node / Height of tree", "Total leaf nodes under root"], "In an AVL tree, the balance factor of every node must strictly be in {-1, 0, 1}."],
      ["Which data structure is optimal for implementing an LRU (Least Recently Used) Cache with O(1) get and put?", "Hash Map combined with a Doubly Linked List", ["Binary Search Tree with a Queue", "Array with linear search", "Min-Heap with Stack"], "The hash map provides O(1) key lookup, while the doubly linked list allows O(1) removal and re-insertion at the head."],
      ["What is the time complexity to insert a new node at the beginning of a Singly Linked List?", "O(1)", ["O(n)", "O(log n)", "O(n log n)"], "Inserting at the head requires creating a node, pointing its next pointer to the current head, and updating head: O(1)."],
      ["In a Red-Black Tree, what is the color of the root node?", "Black", ["Red", "Either Red or Black", "Depends on tree depth"], "Red-Black Tree invariant 2 states that the root must always be Black."],
      ["A queue can be implemented using two stacks. What is the amortized time complexity of the dequeue operation?", "O(1)", ["O(n)", "O(log n)", "O(n^2)"], "Each element is pushed and popped onto stack2 at most once across all operations, yielding O(1) amortized time."],
      ["Which tree data structure is specifically optimized for systems that read and write large blocks of data from secondary storage (disks)?", "B-Tree / B+ Tree", ["Binary Search Tree", "AVL Tree", "Trie"], "B-Trees have high branching factors (fan-out), minimizing the number of disk I/O accesses needed to locate a record."],
      ["What is a Trie data structure primarily used for?", "Fast prefix-based string searching and autocomplete", ["Finding shortest paths in weighted graphs", "Balancing binary search trees", "Sorting floating point numbers"], "A Trie (prefix tree) stores strings character by character, searching a prefix of length k in O(k) time regardless of dictionary size."],
      ["How many NULL pointers exist in a binary tree with n nodes?", "n + 1", ["n", "2n", "n - 1"], "Every node has 2 child pointers (2n total). Since n - 1 edges connect the n nodes, 2n - (n - 1) = n + 1 pointers are NULL."],
    ],
    "database management systems": [
      ["What do the four letters in ACID transaction properties stand for?", "Atomicity, Consistency, Isolation, Durability", ["Accuracy, Concurrency, Integrity, Durability", "Authentication, Consistency, Indexing, Data", "Atomicity, Coherence, Independence, Distribution"], "ACID guarantees that database transactions are processed reliably even through crashes or concurrent execution."],
      ["Which Normal Form eliminates all transitive dependencies on candidate keys?", "Third Normal Form (3NF)", ["First Normal Form (1NF)", "Second Normal Form (2NF)", "Boyce-Codd Normal Form (BCNF)"], "3NF requires that the relation is in 2NF and no non-prime attribute is transitively dependent on any candidate key."],
      ["What is the fundamental difference between B-Trees and B+ Trees?", "In B+ Trees, all data records/pointers are stored exclusively in leaf nodes and leaves are linked sequentially", ["B-Trees do not allow duplicates", "B+ Trees have smaller fan-out", "B-Trees can only run on magnetic tapes"], "B+ trees store keys and record pointers only in leaves, keeping internal nodes compact and leaves linked for fast range queries."],
      ["Which SQL clause is used to filter the results of an aggregate function like SUM() or COUNT()?", "HAVING", ["WHERE", "GROUP BY", "ORDER BY"], "WHERE filters individual rows before aggregation; HAVING filters aggregated groups after GROUP BY."],
      ["Under the Two-Phase Locking (2PL) protocol, what happens during the 'Shrinking Phase'?", "Locks are only released; no new locks can be acquired", ["New locks can be acquired and released simultaneously", "The transaction aborts and rolls back", "Locks are upgraded from shared to exclusive"], "In 2PL, the growing phase only acquires locks; once the first lock is released, the shrinking phase begins and no new locks can be obtained."],
      ["What is a 'Dirty Read' anomaly in database concurrency?", "A transaction reads uncommitted data written by another concurrent transaction", ["A transaction reads duplicate primary keys", "A query executes without an index", "A transaction overwrites disk blocks without logging"], "If transaction T1 modifies a row and T2 reads it before T1 commits, and T1 then rolls back, T2 has read dirty uncommitted data."],
      ["What is the highest isolation level in SQL standard transactions?", "Serializable", ["Repeatable Read", "Read Committed", "Read Uncommitted"], "Serializable guarantees that the execution schedule of concurrent transactions produces the same outcome as some serial execution."],
      ["What type of integrity constraint ensures that a foreign key value must match an existing primary key value in the referenced table?", "Referential Integrity Constraint", ["Domain Integrity Constraint", "Entity Integrity Constraint", "User-Defined Constraint"], "Referential integrity guarantees that relationships between tables remain consistent without dangling pointers."],
      ["In relational algebra, which operator selects rows that satisfy a specified predicate condition?", "Selection (sigma)", ["Projection (pi)", "Cartesian Product (X)", "Natural Join (|><|)"], "Selection (sigma) filters tuples that satisfy condition phi; projection (pi) selects specific columns."],
      ["What is Write-Ahead Logging (WAL) in database recovery?", "Log records must be written to stable storage before the corresponding data pages are written to disk", ["Data pages are written before log records", "Logs are written only when the database server shuts down", "Logs are kept only in volatile RAM"], "WAL ensures the WAL protocol: if the system crashes, uncommitted changes can be undone and committed changes redone from the log."],
      ["A relation R(A, B, C) with functional dependencies A -> B and B -> C is in 3NF if A is the key. Is it in BCNF?", "No, because B is not a superkey in B -> C", ["Yes, it is in BCNF", "No, it violates 1NF", "It is not even in 2NF"], "BCNF requires that for every non-trivial dependency X -> Y, X must be a superkey. Here B is not a superkey, violating BCNF."],
      ["What is a Clustered Index?", "An index that dictates the physical ordering of data rows on the storage disk", ["An index that only indexes foreign keys", "An index stored in the cloud", "A non-unique index with pointers to random disk tracks"], "A table can have only one clustered index because table rows can only be physically stored in one order."],
    ],
    "digital logic": [
      ["According to De Morgan's Laws, the complement of (A + B) is equal to:", "A' . B'", ["A' + B'", "A . B", "(A . B)'"], "De Morgan's theorem states that (A + B)' = A' . B' and (A . B)' = A' + B'."],
      ["Which logic gate is known as a Universal Gate because any Boolean function can be implemented using it alone?", "NAND and NOR", ["AND and OR", "XOR and XNOR", "NOT and BUFFER"], "Both NAND and NOR gates alone are functionally complete and can construct NOT, AND, OR, and XOR operations."],
      ["How many select lines are required for a 32-to-1 Multiplexer (MUX)?", "5 select lines", ["4 select lines", "6 select lines", "32 select lines"], "A 2^n to 1 multiplexer requires n select lines; since 2^5 = 32, exactly 5 select lines are needed."],
      ["What is the 2's complement representation of the decimal number -5 in an 8-bit binary register?", "11111011", ["11111010", "10000101", "00000101"], "+5 in 8-bit binary is 00000101. Inverting bits gives 11111010; adding 1 gives 11111011."],
      ["In a JK flip-flop, what condition causes the 'Race Around Condition'?", "When J = 1, K = 1, and the clock pulse duration is longer than the propagation delay of the flip-flop", ["When J = 0 and K = 0", "When the clock frequency is zero", "When J = 1 and K = 0 with short pulse"], "With J=1, K=1, the output toggles repeatedly while the clock is high if clock pulse width > gate propagation delay."],
      ["How many full adders and half adders are required to construct a 4-bit Parallel Binary Adder?", "3 Full Adders and 1 Half Adder (or 4 Full Adders with carry-in grounded)", ["4 Half Adders", "2 Full Adders and 2 Half Adders", "8 Half Adders"], "The least significant bit needs only a half adder (or full adder with Cin = 0), and the remaining 3 bits need full adders."],
      ["What is the minimum number of 2-input NAND gates required to implement an XOR gate?", "4 NAND gates", ["3 NAND gates", "5 NAND gates", "6 NAND gates"], "An XOR function A (+) B can be implemented using exactly 4 two-input NAND gates."],
      ["What is Setup Time in a flip-flop?", "The minimum time before the active clock edge for which the input data must remain stable", ["The time needed to power on the chip", "The time after the clock edge for which data must remain stable", "The delay between input change and output change"], "Setup time ensures that input logic settles into bistable internal latches before the clock transition occurs."],
    ],
    "computer organization & architecture": [
      ["What are the three classic types of hazards encountered in instruction pipelining?", "Structural, Data, and Control Hazards", ["Arithmetic, Memory, and Register Hazards", "Cache, Bus, and Device Hazards", "Fetch, Decode, and Execute Hazards"], "Structural hazards arise from hardware conflicts, Data hazards from data dependencies (RAW, WAR, WAW), and Control hazards from branches."],
      ["Which cache write policy immediately writes data to both cache and main memory simultaneously?", "Write-Through", ["Write-Back", "Write-Allocate", "No-Write Allocate"], "Write-through updates both cache and main memory on every write, maintaining consistency at the cost of higher bus traffic."],
      ["What is the primary function of the Program Counter (PC) register in a CPU?", "Holds the memory address of the next instruction to be fetched and executed", ["Stores the result of the latest ALU operation", "Holds the decoded opcode", "Counts the total clock cycles elapsed"], "The PC automatically increments after each instruction fetch, pointing to the subsequent instruction in memory."],
      ["In Little-Endian byte ordering, how is a multi-byte word stored in memory?", "The least significant byte (LSB) is stored at the lowest memory address", ["The most significant byte is stored at the lowest address", "Bytes are stored randomly across memory banks", "Even bytes at even addresses, odd bytes at odd addresses"], "Little-Endian stores LSB at low address (x86 standard); Big-Endian stores MSB at low address (network byte order)."],
      ["What is Direct Memory Access (DMA)?", "A feature that allows hardware subsystems to transfer data directly to/from RAM without CPU involvement", ["The CPU reading registers without using the ALU", "Memory allocation without page tables", "Direct execution of code in secondary storage"], "DMA controllers offload bulk I/O transfers from the CPU, generating an interrupt only when the transfer completes."],
      ["What does the Principle of Locality consist of?", "Temporal Locality and Spatial Locality", ["Cache Locality and Disk Locality", "Register Locality and Bus Locality", "Static Locality and Dynamic Locality"], "Temporal locality: recently accessed items are likely to be accessed again soon. Spatial locality: items near recently accessed items are likely to be accessed soon."],
      ["In a k-stage instruction pipeline, executing n independent instructions ideally takes how many clock cycles?", "k + n - 1 cycles", ["k * n cycles", "n^2 cycles", "k^2 + n cycles"], "The first instruction takes k cycles to exit; each of the remaining n - 1 instructions exits one cycle later: k + n - 1 cycles."],
    ],
    "general aptitude": [
      ["If the price of a textbook increases by 20% and then decreases by 20%, what is the net percentage change?", "4% decrease", ["No change", "2% decrease", "4% increase"], "Net change = 20 - 20 - (20 * 20) / 100 = -4%."],
      ["A can complete a work in 12 days and B in 24 days. How many days will they take working together?", "8 days", ["6 days", "10 days", "9 days"], "Together in 1 day = 1/12 + 1/24 = 3/24 = 1/8. So 8 days total."],
      ["What is the HCF of 54, 72, and 90?", "18", ["9", "12", "27"], "54 = 18*3, 72 = 18*4, 90 = 18*5. The highest common factor is 18."],
      ["A train 180 meters long passes a standing pole in 9 seconds. What is the speed of the train in km/h?", "72 km/h", ["54 km/h", "60 km/h", "90 km/h"], "Speed = 180 / 9 = 20 m/s. In km/h = 20 * (18 / 5) = 72 km/h."],
      ["In how many different ways can the letters of the word 'CYCLE' be arranged?", "60 ways", ["120 ways", "24 ways", "30 ways"], "Total letters = 5, with C repeated twice: 5! / 2! = 120 / 2 = 60."],
      ["The ratio of two numbers is 3:4 and their HCF is 4. What is their LCM?", "48", ["12", "24", "36"], "The numbers are 3*4 = 12 and 4*4 = 16. LCM(12, 16) = 48."],
      ["If a sum of money doubles itself at simple interest in 8 years, what is the annual rate of interest?", "12.5%", ["10%", "15%", "8%"], "Interest = Principal. Formula: SI = (P * R * T) / 100 => P = (P * R * 8) / 100 => R = 100 / 8 = 12.5%."],
      ["A person sells an article for ₹450 at a loss of 10%. At what price should he sell it to gain 20%?", "₹600", ["₹540", "₹550", "₹500"], "Cost Price = 450 / 0.9 = ₹500. Selling Price for 20% profit = 500 * 1.2 = ₹600."],
      ["A bag contains 4 red balls, 5 blue balls, and 3 green balls. If one ball is drawn at random, what is the probability that it is blue?", "5/12", ["1/3", "1/4", "5/9"], "Total balls = 4 + 5 + 3 = 12. Blue balls = 5. Probability = 5/12."],
      ["What is the angle between the hour hand and minute hand of a clock at 3:30?", "75 degrees", ["90 degrees", "60 degrees", "85 degrees"], "Angle = |30 * H - (11/2) * M| = |30 * 3 - 5.5 * 30| = |90 - 165| = 75 degrees."],
    ],
    "biology": [
      ["Which organelle is universally known as the powerhouse of the cell due to ATP generation via oxidative phosphorylation?", "Mitochondria", ["Ribosome", "Golgi Apparatus", "Lysosome"], "Mitochondria produce the majority of cellular adenosine triphosphate (ATP) through the electron transport chain and Krebs cycle."],
      ["What is the basic functional and structural unit of the human kidney responsible for filtration and urine formation?", "Nephron", ["Neuron", "Alveolus", "Hepatocyte"], "Each human kidney contains approximately 1 million nephrons that filter blood, reabsorb nutrients, and excrete waste as urine."],
      ["In Mendelian genetics, what is the expected phenotypic ratio in the F2 generation of a monohybrid cross with complete dominance?", "3 : 1", ["9 : 3 : 3 : 1", "1 : 2 : 1", "1 : 1"], "A monohybrid cross between heterozygous parents (Aa x Aa) yields 3 dominant phenotype offspring to 1 recessive phenotype."],
      ["During photosynthesis, which molecule is split during the light-dependent reactions to release oxygen (photolysis)?", "Water (H2O)", ["Carbon dioxide (CO2)", "Glucose", "Chlorophyll"], "Photolysis of water at Photosystem II splits 2H2O into 4H+ + 4e- + O2, releasing oxygen gas into the atmosphere."],
      ["Which enzyme is primarily responsible for unwinding the double helix during DNA replication in cells?", "DNA Helicase", ["DNA Ligase", "DNA Polymerase III", "RNA Primase"], "Helicase breaks hydrogen bonds between nucleotide base pairs to unwind and separate DNA strands at the replication fork."],
      ["In human physiology, which blood group is designated as the universal recipient for red blood cell transfusions?", "AB positive (AB+)", ["O negative (O-)", "A positive (A+)", "B positive (B+)"], "AB+ individuals possess both A and B antigens on RBCs and lack anti-A and anti-B antibodies in plasma, plus they have the Rh factor."],
      ["What process in meiosis leads to genetic recombination between non-sister chromatids of homologous chromosomes?", "Crossing Over (during Pachytene of Prophase I)", ["Cytokinesis", "Centromere fission", "Spindle fiber detachment"], "Crossing over during pachytene exchanges genetic material between homologous chromosomes, driving genetic variation in gametes."],
      ["Which plant hormone is primarily responsible for promoting fruit ripening and leaf abscission?", "Ethylene", ["Auxin", "Gibberellin", "Cytokinin"], "Ethylene (C2H4) is a gaseous plant hormone that accelerates fruit maturation, senescence, and abscission."],
      ["In the human respiratory system, where does the exchange of gases (O2 and CO2) between air and blood take place?", "Alveoli", ["Bronchi", "Trachea", "Larynx"], "Alveoli are microscopic air sacs lined by thin capillaries providing a massive surface area for diffusion of gases."],
      ["Which cellular structure is responsible for the synthesis of proteins by translating mRNA transcripts?", "Ribosome", ["Smooth Endoplasmic Reticulum", "Peroxisome", "Centrosome"], "Ribosomes assemble amino acids into polypeptide chains based on genetic instructions carried by messenger RNA."],
    ],
    "physics": [
      ["What does Newton's Third Law of Motion state?", "For every action, there is an equal and opposite reaction", ["Force equals mass times acceleration", "An object at rest stays at rest unless acted on by net external force", "Momentum is always converted into potential energy"], "Newton's third law states that whenever object A exerts a force on object B, B exerts an equal and opposite force on A."],
      ["What phenomenon causes a light ray to bend when passing obliquely from one optical medium into another with different refractive index?", "Refraction", ["Diffraction", "Total Internal Reflection", "Polarization"], "Refraction occurs because the phase velocity of light changes across media with different optical densities (Snell's Law: n1 sin i = n2 sin r)."],
      ["What is the maximum theoretical efficiency of a heat engine operating between temperatures Th and Tc (in Kelvin)?", "1 - (Tc / Th)", ["Tc / Th", "1 - (Th / Tc)", "(Th - Tc) / Tc"], "Carnot's theorem proves that no heat engine can exceed the Carnot efficiency eta = 1 - Tc/Th."],
      ["According to Coulomb's Law, how does the electrostatic force between two point charges vary with the distance 'r' between them?", "Inversely proportional to the square of distance (1 / r^2)", ["Inversely proportional to r", "Directly proportional to r^2", "Directly proportional to r"], "Coulomb's Law states F = (1 / 4 pi epsilon_0) * (|q1 * q2| / r^2), following an inverse-square relationship."],
      ["What is the de Broglie wavelength of a particle with momentum 'p' (where h is Planck's constant)?", "lambda = h / p", ["lambda = p / h", "lambda = h * p", "lambda = h * c / p"], "Louis de Broglie postulated that matter has wave-like properties with wavelength lambda = h / p = h / (m * v)."],
      ["In simple harmonic motion (SHM), where is the kinetic energy of the oscillating particle at its maximum value?", "At the mean (equilibrium) position", ["At the maximum displacement (amplitude)", "At halfway between mean and extreme", "It is zero everywhere"], "At the equilibrium position, displacement is zero so potential energy is zero and all mechanical energy is kinetic."],
      ["According to Bernoulli's principle, in a streamline fluid flow, an increase in fluid velocity occurs simultaneously with:", "A decrease in static fluid pressure or potential energy", ["An increase in static fluid pressure", "A decrease in temperature only", "An increase in fluid density"], "Bernoulli's equation (P + 0.5 rho v^2 + rho g h = constant) dictates that high flow velocity correlates with lower fluid pressure."],
      ["What is the SI unit of magnetic flux?", "Weber (Wb)", ["Tesla (T)", "Henry (H)", "Gauss (G)"], "Magnetic flux through a surface is measured in Webers (Wb = T * m^2), whereas magnetic flux density (B) is measured in Tesla."],
    ],
    "chemistry": [
      ["What is the hybridization and geometric shape of the carbon atom in a methane (CH4) molecule?", "sp3 hybridization with tetrahedral geometry", ["sp2 hybridization with trigonal planar geometry", "sp hybridization with linear geometry", "dsp2 hybridization with square planar geometry"], "Carbon forms 4 equivalent sigma bonds with hydrogen atoms at bond angles of 109.5 degrees, requiring sp3 hybridization."],
      ["According to Le Chatelier's principle, what happens to the exothermic Haber process (N2 + 3H2 <=> 2NH3 + heat) if the temperature is increased?", "The equilibrium shifts to the left, decreasing ammonia yield", ["The equilibrium shifts to the right, increasing ammonia yield", "The equilibrium is unaffected", "The reaction stops completely"], "Adding heat favors the endothermic reverse reaction, shifting equilibrium toward N2 and H2 and reducing NH3 yield."],
      ["Which element has the highest electronegativity on the Pauling scale?", "Fluorine (F)", ["Oxygen (O)", "Chlorine (Cl)", "Nitrogen (N)"], "Fluorine has a Pauling electronegativity of 3.98, the highest of all chemical elements."],
      ["What is the pH of a 0.001 M hydrochloric acid (HCl) aqueous solution at 25 degrees Celsius?", "3", ["1", "4", "11"], "HCl is a strong monoprotic acid that dissociates completely: [H+] = 10^-3 M. pH = -log10(10^-3) = 3."],
      ["What type of chemical bond involves the equal sharing of electron pairs between two atoms of identical electronegativity (e.g. H2, O2)?", "Nonpolar Covalent Bond", ["Ionic Bond", "Coordinate Covalent Bond", "Hydrogen Bond"], "When electronegativity difference is zero, valence electrons are shared symmetrically, forming a nonpolar covalent bond."],
      ["In an electrochemical Daniell cell (Zn | Zn2+ || Cu2+ | Cu), which metal acts as the anode where oxidation takes place?", "Zinc (Zn)", ["Copper (Cu)", "Platinum", "Graphite"], "Zinc has a lower reduction potential (-0.76 V) than copper (+0.34 V), so Zn oxidizes to Zn2+ at the negative anode."],
      ["Which functional group is characteristic of carboxylic acids?", "-COOH", ["-OH", "-CHO", "-COOR"], "Carboxylic acids contain a carbonyl group (C=O) attached directly to a hydroxyl group (-OH), written as -COOH."],
      ["According to the Ideal Gas Law (PV = nRT), if temperature and volume are held constant while moles of gas double, what happens to pressure?", "Pressure doubles", ["Pressure halves", "Pressure quadruples", "Pressure remains unchanged"], "P = (nRT) / V. If n doubles while R, T, and V remain constant, pressure P directly doubles."],
    ],
    "mathematics": [
      ["If matrix A has eigenvalues 2 and 5, what is the determinant of matrix A?", "10", ["7", "3", "25"], "The determinant of any square matrix is equal to the product of its eigenvalues: det(A) = 2 * 5 = 10."],
      ["What is the derivative of f(x) = ln(sin(x)) with respect to x?", "cot(x)", ["tan(x)", "sec(x)", "-csc(x)"], "By the chain rule: d/dx[ln(sin x)] = (1 / sin x) * cos x = cot x."],
      ["What is the value of the limit: lim(x -> 0) [sin(5x) / x]?", "5", ["1", "0", "Does not exist"], "Using standard limit lim(u -> 0) sin(u)/u = 1, lim(x -> 0) 5 * [sin(5x) / (5x)] = 5 * 1 = 5."],
      ["If events A and B are mutually exclusive with P(A) = 0.3 and P(B) = 0.4, what is P(A or B)?", "0.7", ["0.12", "0.58", "0.10"], "For mutually exclusive events, P(A and B) = 0. Therefore, P(A or B) = P(A) + P(B) = 0.3 + 0.4 = 0.7."],
      ["What is the general solution of the differential equation dy/dx + 2y = 0?", "y = C * e^(-2x)", ["y = C * e^(2x)", "y = 2x + C", "y = C * ln(2x)"], "Separating variables: dy/y = -2 dx => ln|y| = -2x + c => y = C * e^(-2x)."],
      ["What is the trace of a square matrix?", "The sum of the diagonal elements (and sum of eigenvalues)", ["The product of all elements", "The determinant divided by 2", "The rank of the matrix"], "The trace of matrix A is tr(A) = sum(a_ii) = sum(eigenvalues)."],
      ["According to Rolle's Theorem, if f is continuous on [a, b] and differentiable on (a, b) with f(a) = f(b), then:", "There exists at least one c in (a, b) such that f'(c) = 0", ["f'(x) is constant everywhere", "f(x) must be a linear function", "The second derivative is always positive"], "Rolle's theorem guarantees a stationary point where the tangent is horizontal (f'(c) = 0)."],
    ],
    "verbal ability": [
      ["Which word is the most accurate antonym of 'EPHEMERAL'?", "Permanent", ["Transient", "Fleeting", "Fragile"], "'Ephemeral' means lasting for a very short time; its antonym is 'permanent' (lasting indefinitely)."],
      ["Choose the correct sentence following standard English subject-verb agreement:", "The committee has submitted its final report.", ["The committee have submit their report.", "The committee were submitting their report.", "The committee are agreed."], "In formal English, a collective noun acting as a single unit ('the committee') takes a singular verb ('has submitted') and singular pronoun ('its')."],
      ["Identify the meaning of the idiom 'Bite the bullet':", "To face a difficult or unpleasant situation with courage", ["To purchase weapons", "To avoid a confrontation", "To quit prematurely"], "'Bite the bullet' means to endure a painful or inevitable situation with courage and resolution."],
    ],
    "general studies": [
      ["Which part of the Constitution of India deals with the Fundamental Rights of citizens?", "Part III (Articles 12 to 35)", ["Part IV (Articles 36 to 51)", "Part II (Articles 5 to 11)", "Part I (Articles 1 to 4)"], "Part III of the Indian Constitution enshrines the Fundamental Rights (Articles 12-35), often called the Magna Carta of India."],
      ["Who is recognized as the Chairman of the Rajya Sabha (Council of States) in the Parliament of India?", "The Vice-President of India", ["The Prime Minister", "The Speaker of the Lok Sabha", "The Chief Justice of India"], "Article 64 of the Indian Constitution specifies that the Vice-President of India is the ex-officio Chairman of the Rajya Sabha."],
      ["Which river is the longest river flowing entirely within India?", "Ganga", ["Godavari", "Yamuna", "Brahmaputra"], "The Ganga is the longest river flowing within India with a total course of approximately 2,525 km."],
    ],
    "compiler design": [
      ["Which phase of the compiler generates the Abstract Syntax Tree (AST)?", "Syntax Analysis (Parsing)", ["Lexical Analysis", "Semantic Analysis", "Code Optimization"], "The parser analyzes the token stream produced by the scanner against grammar rules to produce a parse tree or AST."],
      ["What is the primary function of the Lexical Analyzer (Scanner)?", "Converts a sequence of characters into a sequence of meaningful tokens", ["Detects type mismatch errors", "Optimizes intermediate representation", "Allocates machine registers"], "Lexical analysis reads raw source code characters and groups them into lexemes/tokens according to regular expressions."],
      ["Which parsing algorithm is a top-down parser that cannot handle left recursion directly?", "LL(1) Parser", ["LR(1) Parser", "LALR(1) Parser", "SLR(1) Parser"], "LL parsers parse from Left to right constructing a Leftmost derivation; left-recursive productions cause infinite loops in LL(1)."],
      ["In compiler optimization, what is 'Dead Code Elimination'?", "Removing code instructions that compute values never used anywhere in the program", ["Deleting commented lines", "Compacting functions into macros", "Removing unused libraries from disk"], "Dead code elimination detects variables or operations whose results are never read, reducing code size and execution time."],
      ["What is a Symbol Table in a compiler?", "A data structure containing information about every identifier (variables, functions, types, scopes) in the source program", ["A table mapping opcodes to hardware pins", "A list of CPU registers", "A hash table storing syntax errors"], "The symbol table is accessed across all compiler phases to check variable declaration, scope, types, and memory offsets."],
    ],
  },

  // Tamil Question Bank (Comprehensive coverage across all exam subjects)
  ta: {
    "operating systems": [
      ["கணினியின் இயக்க முறைமையில் (OS) மெய்நிகர் நினைவகம் (Virtual Memory) எதற்காகப் பயன்படுகிறது?", "முதன்மை நினைவகத்தின் (RAM) கொள்ளளவை விட பெரிய நிரல்களை இயக்க", ["கணினியின் வேகத்தை குறைக்க", "திரையின் தெளிவுத்திறனை அதிகரிக்க", "இணைய வேகத்தை கூட்ட"], "மெய்நிகர் நினைவகம் ஹார்ட் டிஸ்க் இடத்தை பயன்படுத்தி RAM கொள்ளளவை விட பெரிய பணிகளை இயக்க உதவுகிறது."],
      ["எந்த பக்க மாற்ற வழிமுறை (Page Replacement Algorithm) பெலாடியின் முரண்பாட்டால் (Belady's Anomaly) பாதிக்கப்படுகிறது?", "FIFO (First In First Out)", ["LRU (Least Recently Used)", "Optimal Page Replacement", "LFU (Least Frequently Used)"], "FIFO முறையில் பிரேம்களின் எண்ணிக்கை அதிகரிக்கும் போதும் சில வேளைகளில் பக்க பிழைகள் (Page Faults) அதிகரிக்கும்."],
      ["கணினி இயக்க முறைமையில் டெட்லாக் (Deadlock) ஏற்படுவதற்கான நான்கு நிபந்தனைகள் யாவை?", "Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait", ["Paging, Segmentation, Swapping, Thrashing", "Starvation, Priority Inversion, Aging, Mutex", "Deadlock Prevention, Avoidance, Detection"], "இந்த நான்கு காஃப்மேன் (Coffman) நிபந்தனைகளும் ஒரே நேரத்தில் நிலவும் போது மட்டுமே டெட்லாக் உருவாகும்."],
      ["CPU அட்டவணைப்படுத்தலில் (CPU Scheduling) சராசரி காத்திருப்பு நேரத்தை (Average Waiting Time) குறைக்கும் வழிமுறை எது?", "SJF (Shortest Job First)", ["FCFS (First Come First Served)", "Round Robin", "Priority Scheduling"], "SJF முறை குறைந்த கால அளவு கொண்ட செயல்முறைகளுக்கு முன்னுரிமை அளித்து சராசரி காத்திருப்பு நேரத்தை குறைக்கிறது."],
      ["டிரான்ஸ்லேஷன் லுக்அசைட் பஃபர் (TLB) என்பதன் முக்கிய பயன்பாடு என்ன?", "மெய்நிகர் முகவரியை இயற்பியல் முகவரியாக மாற்றும் வேகமான வன்பொருள் கேச் (Cache)", ["வட்டு திட்டமிடல் வழிமுறை", "செயல்முறை வரிசை", "கோப்பு மேலாண்மை"], "TLB என்பது அடிக்கடி பயன்படுத்தப்படும் பக்க அட்டவணை பதிவுகளை விரைவாக அணுக உதவும் வன்பொருள் கேச் ஆகும்."],
    ],
    "computer networks": [
      ["OSI குறிப்பு மாதிரியில் (OSI Model) எத்தனை அடுக்குகள் (Layers) உள்ளன?", "7 அடுக்குகள்", ["5 அடுக்குகள்", "4 அடுக்குகள்", "8 அடுக்குகள்"], "OSI மாதிரியில் 7 அடுக்குகள் உள்ளன: Physical, Data Link, Network, Transport, Session, Presentation, Application."],
      ["நெட்வொர்க்கில் நம்பகமான, இணைப்பு அடிப்படையிலான (Connection-Oriented) தரவுப் பரிமாற்றத்தை வழங்கும் நெறிமுறை எது?", "TCP (Transmission Control Protocol)", ["UDP (User Datagram Protocol)", "IP (Internet Protocol)", "ICMP"], "TCP என்பது மூன்று வழி கைகுலுக்கல் (Three-Way Handshake) மற்றும் பிழை திருத்தத்துடன் செயல்படும் இணைப்பு நெறிமுறையாகும்."],
      ["IPv4 முகவரியின் பிட் அளவு என்ன?", "32 பிட்கள்", ["64 பிட்கள்", "128 பிட்கள்", "16 பிட்கள்"], "IPv4 முகவரிகள் 32 பிட்களைக் கொண்டவை (சுமார் 4.3 பில்லியன் தனித்துவ முகவரிகள்)."],
      ["ஒரு ஐபி முகவரியை (IP Address) அதனுடன் தொடர்புடைய MAC முகவரியாக மாற்றும் நெறிமுறை எது?", "ARP (Address Resolution Protocol)", ["DNS (Domain Name System)", "DHCP", "FTP"], "ARP என்பது உள்ளூர் நெட்வொர்க்கில் உள்ள ஐபி முகவரியின் இயற்பியல் MAC முகவரியை அறிய பயன்படுகிறது."],
      ["இணையத்தில் வலைத்தள முகவரிகளை (எ.கா. prepcycle.com) எண் ஐபி முகவரிகளாக மாற்றுவது எது?", "DNS (Domain Name System)", ["HTTP", "TCP", "BGP"], "DNS (டொமைன் பெயர் அமைப்பு) என்பது மனிதர்கள் படிக்கும் முகவரிகளை கணினிகள் அறியும் ஐபி முகவரியாக மொழிபெயர்க்கிறது."],
    ],
    "theory of computation": [
      ["DFA (Deterministic Finite Automaton) எந்த மொழி வகையை அடையாளம் காண்கிறது?", "வழக்கமான மொழிகள் (Regular Languages)", ["சூழல் சார்பற்ற மொழிகள் (Context-Free)", "டூரிங் மொழிகள்", "இயற்கை மொழிகள்"], "DFA மற்றும் NFA ஆகியவை வழக்கமான மொழிகளை (Regular Languages - Type 3) மட்டுமே அடையாளம் காணும்."],
      ["டூரிங் இயந்திரங்களுக்கான ஹால்டிங் சிக்கல் (Halting Problem) என்பது:", "தீர்மானிக்க முடியாதது (Undecidable)", ["நேரியல் நேரத்தில் தீர்க்கக்கூடியது", "எளிய கணக்கீடு", "வழக்கமான மொழி"], "டூரிங் இயந்திரம் ஒரு குறிப்பிட்ட உள்ளீட்டில் நிற்குமா அல்லது முடிவில்லாமல் இயங்குமா என்பதைக் கணக்கிட எந்த பொதுவான வழிமுறையும் இல்லை."],
      ["புஷ் டவுன் ஆட்டோமேட்டாவால் (PDA) ஏற்றுக்கொள்ளப்படும் மொழி எது?", "சூழல் சார்பற்ற மொழிகள் (Context-Free Languages)", ["வழக்கமான மொழிகள் மட்டுமே", "சூழல் சார்ந்த மொழிகள்", "டூரிங் மொழிகள்"], "PDA என்பது ஒரு ஸ்டாக் (Stack) நினைவகத்தைப் பயன்படுத்தி சூழல் சார்பற்ற மொழிகளை (CFL) அடையாளம் காணும்."],
    ],
    "algorithms": [
      ["குவிக்சார்ட் (QuickSort) வழிமுறையின் மிக மோசமான நேர சிக்கலான தன்மை (Worst-case Time Complexity) என்ன?", "O(n^2)", ["O(n log n)", "O(n)", "O(log n)"], "பிவோட் உறுப்பு மிகவும் சிறியதாகவோ அல்லது பெரியதாகவோ தொடர்ந்து தேர்ந்தெடுக்கப்படும் போது QuickSort O(n^2) நேரத்தை எடுக்கும்."],
      ["எடை குறைந்த குறுகிய பாதையை (Shortest Path) கண்டறிய பயன்படும் கிரீடி (Greedy) வழிமுறை எது?", "டிஜிக்ஸ்ட்ரா வழிமுறை (Dijkstra's Algorithm)", ["ப்ரிம்ஸ் வழிமுறை", "குரூஸ்கல் வழிமுறை", "பைனரி தேடல்"], "Dijkstra வழிமுறை நேர்மறை எடையுள்ள வரைபடங்களில் தொடக்க புள்ளியிலிருந்து அனைத்து புள்ளிகளுக்கும் குறுகிய பாதையை கண்டறியும்."],
      ["டைனமிக் புரோகிராமிங் (Dynamic Programming) பயன்படுத்துவதற்கு தேவையான முக்கிய நிபந்தனை என்ன?", "உகந்த துணை அமைப்பு மற்றும் ஒன்றுடன் ஒன்று மேலெழும் துணை சிக்கல்கள் (Overlapping Subproblems)", ["வரிசைப்படுத்தப்பட்ட தரவு மட்டுமே", "சீரற்ற தேர்வு", "வடிவியல் சமச்சீர்"], "துணை சிக்கல்களின் விடைகளை சேமித்து மீண்டும் பயன்படுத்துவதே டைனமிக் புரோகிராமிங்கின் அடிப்படை தத்துவமாகும்."],
    ],
    "data structures": [
      ["டேட்டா கட்டமைப்புகளில் (Data Structures) LIFO (Last In First Out) கொள்கையைப் பின்பற்றுவது எது?", "ஸ்டாக் (Stack)", ["வரிசை (Queue)", "இணைக்கப்பட்ட பட்டியல் (Linked List)", "மரம் (Tree)"], "ஸ்டாக் (Stack) LIFO கொள்கையைக் கடைப்பிடிக்கிறது (கடைசியாக நுழைந்தது முதலில் வெளியேறும்)."],
      ["வரிசை (Queue) எந்த தத்துவத்தின் கீழ் செயல்படுகிறது?", "FIFO (First In First Out)", ["LIFO (Last In First Out)", "FILO", "முன்னுரிமை மட்டுமே"], "வரிசையில் முதலில் வந்த உறுப்பு முதலில் வெளியேறும் (First In First Out)."],
      ["சமநிலைப்படுத்தப்பட்ட பைனரி தேடல் மரத்தில் (Balanced BST) ஒரு உறுப்பைத் தேடுவதற்கான நேர சிக்கல் என்ன?", "O(log n)", ["O(n)", "O(1)", "O(n^2)"], "மரத்தின் உயரம் log n ஆக சமநிலைப்படுத்தப்படுவதால் தேடல் O(log n) நேரத்தில் முடிவடைகிறது."],
    ],
    "database management systems": [
      ["ACID பரிவர்த்தனை பண்புகளில் (ACID Properties) 'A' எதைக் குறிக்கிறது?", "அணுத்தன்மை (Atomicity - எல்லாம் அல்லது எதுவுமில்லை)", ["துல்லியம்", "அங்கீகாரம்", "அணுகல்"], "Atomicity என்பது பரிவர்த்தனையின் அனைத்து செயல்பாடுகளும் முழுமையாக வெற்றிபெற வேண்டும் அல்லது எந்த மாற்றமும் இன்றி ரத்து செய்யப்பட வேண்டும்."],
      ["எந்த இயல்புநிலை வடிவம் (Normal Form) இடைநிலை சார்புகளை (Transitive Dependencies) நீக்குகிறது?", "மூன்றாம் இயல்புநிலை வடிவம் (3NF)", ["1NF", "2NF", "BCNF"], "3NF என்பது எந்தவொரு முதன்மை அல்லாத பண்பும் முதன்மை திறவுகோலை மட்டுமே சார்ந்து இருக்க வேண்டும் என்பதை உறுதி செய்கிறது."],
      ["SQL இல் ஒரு திரட்டு செயல்பாட்டின் முடிவை (Aggregate Function) வடிகட்ட எந்த விதி பயன்படுகிறது?", "HAVING", ["WHERE", "GROUP BY", "ORDER BY"], "WHERE தனிப்பட்ட வரிசைகளை வடிகட்டுகிறது; HAVING திரட்டப்பட்ட குழுக்களை வடிகட்டுகிறது."],
    ],
    "digital logic": [
      ["டி மார்கனின் விதிகளின்படி (De Morgan's Laws), (A + B)' எதற்கு சமம்?", "A' . B'", ["A' + B'", "A . B", "A' + B"], "டி மார்கனின் கூற்றுப்படி கூட்டலின் நிரப்பு என்பது பெருக்கலின் நிரப்புகளுக்கு சமம்: (A + B)' = A' . B'."],
      ["எந்த லாஜிக் கேட் உலகளாவிய கேட் (Universal Gate) என அழைக்கப்படுகிறது?", "NAND மற்றும் NOR", ["AND மற்றும் OR", "XOR", "NOT"], "NAND மற்றும் NOR கேட்களை மட்டுமே கொண்டு எந்த ஒரு பூலியன் செயல்பாட்டையும் உருவாக்க முடியும்."],
      ["16 உள்ளீடுகளைக் கொண்ட மல்டிபிளெக்சருக்கு (16-to-1 MUX) எத்தனை தேர்வு கோடுகள் (Select Lines) தேவை?", "4 தேர்வு கோடுகள்", ["3 தேர்வு கோடுகள்", "5 தேர்வு கோடுகள்", "8 தேர்வு கோடுகள்"], "2^4 = 16 என்பதால் சரியாக 4 தேர்வு கோடுகள் தேவைப்படுகின்றன."],
    ],
    "computer organization & architecture": [
      ["ஒரு செயலியின் (CPU) வழிமுறை பைப்லைனிங்கில் (Pipelining) ஏற்படும் மூன்று முக்கிய ஆபத்துகள் யாவை?", "கட்டமைப்பு, தரவு மற்றும் கட்டுப்பாட்டு ஆபத்துகள் (Structural, Data, Control Hazards)", ["நினைவகம், பஸ், கேச்", "எண்கணிதம், தர்க்கம், பதிவு", "மின்சாரம், வெப்பம், கடிகாரம்"], "ஹார்ட்வேர் மோதல்கள் (Structural), சார்புகள் (Data), கிளைகள் (Control) ஆகியவை பைப்லைன் தாமதங்களை உருவாக்குகின்றன."],
      ["கேச் நினைவகத்தில் (Cache Memory) உள்ள இடஞ்சார்ந்த வட்டாரம் (Spatial Locality) எதைக் குறிக்கிறது?", "அணுகப்பட்ட முகவரிக்கு அருகிலுள்ள முகவரிகள் விரைவில் அணுகப்படும் வாய்ப்பு", ["ஒரே முகவரி மீண்டும் அணுகப்படுவது", "வட்டு நினைவகம்", "பதிவேடு பரிமாற்றம்"], "Spatial Locality என்பது ஒரு நினைவக முகவரி அணுகப்படும் போது அதற்கு அருகிலுள்ள தரவுகளும் அணுகப்படும் சாத்தியக்கூறைக் குறிக்கிறது."],
    ],
    "compiler design": [
      ["தொகுப்பியின் (Compiler) எந்த நிலை எழுத்துக்களின் வரிசையை டோக்கன்களாக (Tokens) மாற்றுகிறது?", "லெக்சிகல் பகுப்பாய்வு (Lexical Analysis)", ["தொடரியல் பகுப்பாய்வு", "சொற்பொருள் பகுப்பாய்வு", "குறியீட்டு உகப்பாக்கம்"], "லெக்சிகல் பகுப்பாய்வி (ஸ்கேனர்) மூலக் குறியீட்டை படித்து டோக்கன்களாக பிரிக்கிறது."],
      ["சுருக்க தொடரியல் மரத்தை (AST) உருவாக்கும் தொகுப்பியின் நிலை எது?", "தொடரியல் பகுப்பாய்வு (Syntax Analysis / Parsing)", ["லெக்சிகல்", "குறியீடு உருவாக்கம்", "உகப்பாக்கம்"], "பார்சர் (Parser) இலக்கண விதிகளை சரிபார்த்து வாக்கிய அமைப்பை மர வடிவில் உருவாக்குகிறது."],
    ],
    "biology": [
      ["செல்லின் ஆற்றல் மையம் (Powerhouse of the Cell) என்று அழைக்கப்படும் செல் உறுப்பு எது?", "மைட்டோகாண்ட்ரியா (Mitochondria)", ["ரைபோசோம்", "லைசோசோம்", "கோல்கை உடலம்"], "மைட்டோகாண்ட்ரியா செல்லுலார் சுவாசத்தின் மூலம் ஏடிபி (ATP) மூலக்கூறுகளை உற்பத்தி செய்வதால் ஆற்றல் மையம் எனப்படுகிறது."],
      ["மனித சிறுநீரகத்தின் அடிப்படை வடிகட்டுதல் மற்றும் செயல்பாட்டு அலகு எது?", "நெப்ரான் (Nephron)", ["நியூரான்", "அல்வியோலஸ்", "ஹெபடோசைட்"], "சிறுநீரகத்தில் உள்ள லட்சக்கணக்கான நெப்ரான்கள் இரத்தத்தை வடிகட்டி சிறுநீரை உருவாக்குகின்றன."],
      ["டிஎன்ஏ (DNA) இரட்டிப்பின் போது இரட்டை ஹெலிக்ஸ் இழைகளை பிரிக்கும் நொதி எது?", "டிஎன்ஏ ஹெலிகேஸ் (DNA Helicase)", ["டிஎன்ஏ லிகேஸ்", "பாலிமரேஸ்", "பிரைமேஸ்"], "ஹெலிகேஸ் நொதி ஹைட்ரஜன் பிணைப்புகளை உடைத்து டிஎன்ஏ இழைகளை பிரிக்கிறது."],
      ["மனித இரத்த வகைகளில் அனைவருக்கும் இரத்தத்தை வழங்கக்கூடிய பொது வழங்கி (Universal Donor) எது?", "O நெகட்டிவ் (O-)", ["AB பாசிட்டிவ்", "A பாசிட்டிவ்", "B நெகட்டிவ்"], "O- இரத்த சிவப்பணுக்களில் A, B மற்றும் Rh ஆன்டிஜென்கள் இல்லாததால் அனைவருக்கும் பொருந்தும்."],
    ],
    "physics": [
      ["நியூட்டனின் மூன்றாம் இயக்க விதி கூறுவது என்ன?", "ஒவ்வொரு விசைக்கும் சமமான மற்றும் எதிர் திசையிலான விசை உண்டு", ["விசை = நிறை x முடுக்கம்", "நிலைமம் பற்றிய விதி", "ஆற்றல் மாறா விதி"], "ஒரு பொருள் மீது விசை செலுத்தப்படும் போது அந்த பொருள் சமமான எதிர் விசையை செலுத்துகிறது."],
      ["ஒளி ஒரு ஊடகத்திலிருந்து மற்றொரு ஊடகத்திற்கு செல்லும்போது வளையும் நிகழ்வு என்ன?", "ஒளிவிலகல் (Refraction)", ["ஒளி எதிரொளிப்பு", "விளிம்பு விளைவு", "முழு அக எதிரொளிப்பு"], "வெவ்வேறு ஊடகங்களில் ஒளியின் வேகம் மாறுபடுவதால் ஒளிக்கதிர் வளைந்து செல்கிறது (ஸ்னெல் விதி: n1 sin i = n2 sin r)."],
      ["காந்தப் பாயத்தின் (Magnetic Flux) SI அலகு என்ன?", "வெபர் (Weber - Wb)", ["டெஸ்லா", "ஹென்றி", "காஸ்"], "காந்தப் பாயமானது வெபர் (Wb) அலகினால் அளவிடப்படுகிறது."],
    ],
    "chemistry": [
      ["தூய நீரின் pH மதிப்பு 25 டிகிரி செல்சியஸில் என்ன?", "7 (நடுநிலை)", ["0", "1", "14"], "தூய நீர் நடுநிலையானது, இதில் [H+] = [OH-] = 10^-7 M, எனவே pH = 7."],
      ["மீத்தேன் (CH4) மூலக்கூறில் உள்ள கார்பனின் இனக்கலப்பு (Hybridization) என்ன?", "sp3 இனக்கலப்பு (நான்முகி வடிவம்)", ["sp2", "sp", "dsp2"], "கார்பன் 4 ஹைட்ரஜன் அணுக்களுடன் சமமான 4 சிக்மா பிணைப்புகளை உருவாக்கி sp3 வடிவம் பெறுகிறது."],
      ["தனிம வரிசை அட்டவணையில் அதிக எலக்ட்ரான் கவர்தன்மை (Electronegativity) கொண்ட தனிமம் எது?", "புளூரின் (Fluorine - F)", ["ஆக்ஸிஜன்", "குளோரின்", "நைட்ரஜன்"], "பாலிங் அளவுகோலில் புளூரின் 3.98 மதிப்பைப் பெற்று மிக உயர்ந்த எலக்ட்ரான் கவர் ஆற்றலைக் கொண்டுள்ளது."],
    ],
    "mathematics": [
      ["ஒரு 2x2 அணியின் ஐகன் மதிப்புகள் (Eigenvalues) 3 மற்றும் 4 எனில், அந்த அணியின் அணிக்கோவை மதிப்பு (Determinant) என்ன?", "12", ["7", "1", "0.75"], "எந்த ஒரு சதுர அணியின் அணிக்கோவை மதிப்பும் அதன் ஐகன் மதிப்புகளின் பெருக்கற்பலனுக்கு சமம்: 3 x 4 = 12."],
      ["sin(5x) / x என்ற சார்பின் எல்லை x -> 0 இல் என்ன மதிப்பு பெறும்?", "5", ["1", "0", "முடிவிலி"], "lim(x->0) [sin(kx)/x] = k என்ற அடிப்படை கணித விதியின்படி இதன் மதிப்பு 5 ஆகும்."],
    ],
    "general studies": [
      ["இந்திய அரசியலமைப்பின் எந்தப் பகுதி குடிமக்களின் அடிப்படை உரிமைகளை (Fundamental Rights) கையாள்கிறது?", "பகுதி III (பிரிவுகள் 12 முதல் 35 வரை)", ["பகுதி IV", "பகுதி II", "பகுதி I"], "இந்திய அரசியலமைப்பின் பகுதி III அடிப்படை உரிமைகளை உத்தரவாதம் செய்கிறது (இந்தியாவின் மகாசாசனம்)."],
      ["மாநிலங்களவையின் (Rajya Sabha) அலுவல் வழித் தலைவராக செயல்படுபவர் யார்?", "இந்திய குடியரசு துணைத் தலைவர்", ["பிரதமர்", "மக்களவை சபாநாயகர்", "தலைமை நீதிபதி"], "இந்திய அரசியலமைப்பு பிரிவு 64-இன் படி குடியரசு துணைத் தலைவர் மாநிலங்களவையின் தலைவராவார்."],
    ],
    "general aptitude": [
      ["ஒரு புத்தகத்தின் விலை 20% அதிகரிக்கப்பட்டு பின்னர் 20% குறைக்கப்பட்டால், நிகர மாற்ற சதவீதம் என்ன?", "4% குறைவு", ["மாற்றமில்லை", "2% குறைவு", "4% அதிகரிப்பு"], "சூத்திரம்: 20 - 20 - (20 * 20)/100 = -4%. எனவே 4% குறைகிறது."],
      ["A ஒரு வேலையை 10 நாட்களிலும், B அதே வேலையை 15 நாட்களிலும் முடிப்பார்கள் எனில் இருவரும் சேர்ந்து எத்தனை நாட்களில் முடிப்பார்கள்?", "6 நாட்கள்", ["5 நாட்கள்", "8 நாட்கள்", "7.5 நாட்கள்"], "1/10 + 1/15 = (3 + 2)/30 = 5/30 = 1/6. எனவே இருவரும் சேர்ந்து 6 நாட்களில் முடிப்பார்கள்."],
      ["24, 36, மற்றும் 60 ஆகியவற்றின் மீப்பெரு பொது வகுத்தி (HCF) என்ன?", "12", ["6", "18", "24"], "12 என்பது 24, 36, 60 ஆகிய மூன்றையும் மீதமின்றி வகுக்கும் மிகப்பெரிய பொது எண் ஆகும்."],
      ["180 மீட்டர் நீளமுள்ள ரயில் ஒரு கம்பத்தை 9 வினாடிகளில் கடந்தால், அதன் வேகம் கி.மீ/மணியில் என்ன?", "72 கி.மீ/மணி", ["54 கி.மீ/மணி", "60 கி.மீ/மணி", "90 கி.மீ/மணி"], "வேகம் = 180 / 9 = 20 மீ/வி. கி.மீ/மணியில் = 20 * (18 / 5) = 72 கி.மீ/மணி."],
    ],
  },
};

// Map search aliases to standard canonical topics
function resolveCanonicalTopic(query = "") {
  const q = String(query).toLowerCase().trim();
  if (q.includes("bio") || q.includes("botan") || q.includes("zool") || q.includes("cell") || q.includes("genetics") || q.includes("physio") || q.includes("neet")) {
    return "biology";
  }
  if (q.includes("physic") || q.includes("mechanic") || q.includes("thermodynamic") || q.includes("optics") || q.includes("kinematic")) {
    return "physics";
  }
  if (q.includes("chem") || q.includes("organic") || q.includes("inorganic") || q.includes("periodic") || q.includes("reaction")) {
    return "chemistry";
  }
  if (q.includes("math") || q.includes("calculus") || q.includes("algebra") || q.includes("matrix") || q.includes("probability")) {
    return "mathematics";
  }
  if (q.includes("operat") || q === "os" || q.includes("paging") || q.includes("process") || q.includes("deadlock")) {
    return "operating systems";
  }
  if (q.includes("network") || q === "cn" || q.includes("tcp") || q.includes("protocol") || q.includes("ip ")) {
    return "computer networks";
  }
  if (q.includes("comput") || q.includes("automata") || q === "toc" || q.includes("turing") || q.includes("dfa") || q.includes("grammar")) {
    return "theory of computation";
  }
  if (q.includes("algo") || q.includes("sorting") || q.includes("greedy") || q.includes("dynamic prog") || q.includes("complexity")) {
    return "algorithms";
  }
  if (q.includes("data struct") || q === "ds" || q.includes("stack") || q.includes("tree") || q.includes("queue") || q.includes("heap")) {
    return "data structures";
  }
  if (q.includes("dbms") || q.includes("database") || q.includes("sql") || q.includes("normal") || q.includes("transact")) {
    return "database management systems";
  }
  if (q.includes("digital") || q.includes("logic") || q.includes("k-map") || q.includes("boolean") || q.includes("gate")) {
    return "digital logic";
  }
  if (q.includes("architect") || q.includes("coa") || q.includes("pipelin") || q.includes("cache")) {
    return "computer organization & architecture";
  }
  if (q.includes("compiler") || q.includes("parser") || q.includes("lexical") || q.includes("syntax")) {
    return "compiler design";
  }
  if (q.includes("verbal") || q.includes("english") || q.includes("comprehension") || q.includes("varc")) {
    return "verbal ability";
  }
  if (q.includes("polity") || q.includes("history") || q.includes("geography") || q.includes("upsc") || q.includes("ssc") || q.includes("general studies")) {
    return "general studies";
  }
  return "general aptitude";
}

// Procedural dynamic question generator - computes new numbers, formulas, and parameters every time
function generateProceduralQuestion(canonical, index, normalizedLang = "en") {
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  if (canonical === "operating systems") {
    const types = [
      () => {
        const pageSizeKB = randPick([2, 4, 8, 16, 32, 64]);
        const offsetBits = 10 + Math.round(Math.log2(pageSizeKB));
        const addrBits = randPick([32, 48, 64]);
        const vpnBits = addrBits - offsetBits;
        return [
          `In a ${addrBits}-bit virtual memory architecture with a page size of ${pageSizeKB} KB, how many bits are allocated for the Page Offset and Virtual Page Number (VPN) respectively?`,
          `${offsetBits} bits for Page Offset, ${vpnBits} bits for VPN`,
          [
            `${offsetBits - 2} bits for Page Offset, ${vpnBits + 2} bits for VPN`,
            `${offsetBits + 4} bits for Page Offset, ${vpnBits - 4} bits for VPN`,
            `12 bits for Page Offset, ${addrBits - 12} bits for VPN`,
          ],
          `Page size ${pageSizeKB} KB = ${pageSizeKB * 1024} bytes = 2^${offsetBits} bytes. Hence, Page Offset requires ${offsetBits} bits. The remaining bits (${addrBits} - ${offsetBits} = ${vpnBits}) constitute the Virtual Page Number.`
        ];
      },
      () => {
        const initVal = randInt(2, 6);
        const waitOps = randInt(3, 8);
        const sigOps = randInt(1, 4);
        const finalVal = initVal - waitOps + sigOps;
        return [
          `A counting semaphore S is initialized to ${initVal}. If ${waitOps} P (wait) operations and ${sigOps} V (signal) operations are executed concurrently, what is the resulting value of S?`,
          `${finalVal}`,
          [`${finalVal + 1}`, `${finalVal - 2}`, `${Math.max(0, finalVal)}`],
          `Initial value = ${initVal}. Each wait() decrements S by 1 (-${waitOps}), and each signal() increments S by 1 (+${sigOps}). Final S = ${initVal} - ${waitOps} + ${sigOps} = ${finalVal}.`
        ];
      },
      () => {
        const nForks = randInt(2, 4);
        const totalProcs = Math.pow(2, nForks);
        const childProcs = totalProcs - 1;
        return [
          `A program executes ${nForks} sequential fork() system calls in a linear sequence without loops. How many total child processes are spawned into existence?`,
          `${childProcs} child processes (total ${totalProcs} processes)`,
          [
            `${nForks} child processes`,
            `${totalProcs} child processes`,
            `${Math.pow(2, nForks - 1)} child processes`,
          ],
          `Each fork() doubles the number of active processes. For ${nForks} calls, 2^${nForks} = ${totalProcs} total processes exist. Subtracting the original parent gives ${childProcs} child processes.`
        ];
      },
      () => {
        const b1 = randInt(3, 8);
        const b2 = randInt(9, 14);
        const b3 = randInt(15, 20);
        const avgWait = (((0) + (b1) + (b1 + b2)) / 3).toFixed(2);
        return [
          `Three independent processes P1, P2, and P3 arrive at time 0 with burst times ${b1} ms, ${b2} ms, and ${b3} ms respectively. Under non-preemptive Shortest Job First (SJF) scheduling, what is the average waiting time?`,
          `${avgWait} ms`,
          [
            `${(Number(avgWait) + 2.5).toFixed(2)} ms`,
            `${(Number(avgWait) - 1.8).toFixed(2)} ms`,
            `${(((b1 + b2 + b3) / 3)).toFixed(2)} ms`,
          ],
          `Under SJF, execution order is P1 (${b1}ms) -> P2 (${b2}ms) -> P3 (${b3}ms). Waiting times: P1 = 0, P2 = ${b1}, P3 = ${b1 + b2}. Average waiting time = (0 + ${b1} + ${b1 + b2}) / 3 = ${avgWait} ms.`
        ];
      },
    ];
    return types[index % types.length]();
  }

  if (canonical === "computer networks") {
    const types = [
      () => {
        const mask = randPick([25, 26, 27, 28, 29]);
        const hostBits = 32 - mask;
        const total = Math.pow(2, hostBits);
        const usable = total - 2;
        return [
          `In an IPv4 network utilizing the subnet prefix /${mask}, what is the total number of usable host IP addresses per subnet?`,
          `${usable} usable hosts`,
          [`${total} usable hosts`, `${usable - 2} usable hosts`, `${Math.pow(2, hostBits - 1)} usable hosts`],
          `A /${mask} subnet provides 32 - ${mask} = ${hostBits} host bits. Total addresses = 2^${hostBits} = ${total}. Subtracting network and broadcast addresses leaves ${usable} usable host addresses.`
        ];
      },
      () => {
        const bwMbps = randPick([10, 50, 100, 1000]);
        const rttMs = randPick([10, 20, 50, 100]);
        const bdpBits = (bwMbps * 1e6) * (rttMs / 1000);
        const bdpKB = (bdpBits / (8 * 1024)).toFixed(1);
        return [
          `A point-to-point network link has a bandwidth of ${bwMbps} Mbps and a Round-Trip Time (RTT) of ${rttMs} ms. What is the Bandwidth-Delay Product (BDP) in Kilobytes (KB)?`,
          `${bdpKB} KB`,
          [`${(Number(bdpKB) * 2).toFixed(1)} KB`, `${(Number(bdpKB) / 2).toFixed(1)} KB`, `${(Number(bdpKB) + 15).toFixed(1)} KB`],
          `BDP = Bandwidth * RTT = (${bwMbps} * 10^6 bps) * (${rttMs} / 1000 s) = ${bdpBits} bits = ${bdpKB} KB.`
        ];
      },
      () => {
        const packetSize = randInt(2400, 4800);
        const payloadPerFrag = 1480;
        const frags = Math.ceil((packetSize - 20) / payloadPerFrag);
        return [
          `An IPv4 packet of total length ${packetSize} bytes (including a 20-byte IP header) enters an Ethernet link with MTU = 1500 bytes. Into how many fragments will this packet be divided?`,
          `${frags} fragments`,
          [`${frags + 1} fragments`, `${frags - 1} fragments`, `${Math.ceil(packetSize / 1500)} fragments`],
          `Max payload per fragment = MTU (1500) - IP header (20) = 1480 bytes. Total data = ${packetSize - 20} bytes. Fragments = ceil(${packetSize - 20} / 1480) = ${frags}.`
        ];
      },
    ];
    return types[index % types.length]();
  }

  if (canonical === "biology") {
    const types = [
      () => {
        const adenPct = randPick([18, 22, 26, 31, 34]);
        const cytPct = 50 - adenPct;
        return [
          `According to Chargaff's rules of double-stranded DNA, if a genomic sample contains ${adenPct}% Adenine, what is the exact percentage of Cytosine?`,
          `${cytPct}%`,
          [`${adenPct}%`, `${100 - 2 * adenPct}%`, `${50 + adenPct}%`],
          `In double-stranded DNA, [A] = [T] and [G] = [C]. Since [A] = ${adenPct}%, [T] = ${adenPct}%. The remaining ${100 - 2 * adenPct}% is equally split between Guanine and Cytosine: ${cytPct}%.`
        ];
      },
      () => {
        const moles = randInt(2, 6);
        const atpLow = moles * 36;
        const atpHigh = moles * 38;
        return [
          `During complete aerobic oxidation of ${moles} moles of glucose through Glycolysis, the TCA cycle, and Oxidative Phosphorylation, what is the net yield of ATP?`,
          `${atpLow} to ${atpHigh} ATP`,
          [`${moles * 2} ATP`, `${moles * 30} to ${moles * 32} ATP`, `${moles * 44} ATP`],
          `Aerobic respiration yields approximately 36 to 38 ATP per glucose molecule. For ${moles} moles, the yield is ${moles} * 36 = ${atpLow} to ${moles} * 38 = ${atpHigh} ATP.`
        ];
      },
      () => {
        const nucCount = randPick([450, 600, 750, 900, 1200]);
        const aaCount = nucCount / 3;
        return [
          `An open reading frame (ORF) on an mRNA transcript consists of ${nucCount} coding nucleotides (excluding the final stop codon). How many amino acids will the synthesized peptide contain?`,
          `${aaCount} amino acids`,
          [`${nucCount} amino acids`, `${aaCount - 1} amino acids`, `${nucCount * 3} amino acids`],
          `Each codon specifies one amino acid and consists of 3 consecutive nucleotides. Therefore, ${nucCount} nucleotides / 3 = ${aaCount} amino acids.`
        ];
      },
    ];
    return types[index % types.length]();
  }

  if (canonical === "mathematics") {
    const types = [
      () => {
        const l1 = randInt(1, 5);
        const l2 = randInt(6, 10);
        const tr = l1 + l2;
        const det = l1 * l2;
        return [
          `For a 2x2 matrix A, the trace is equal to ${tr} and the determinant is equal to ${det}. What are the eigenvalues of matrix A?`,
          `${l1} and ${l2}`,
          [`${l1 - 1} and ${l2 + 1}`, `${-l1} and ${-l2}`, `${tr} and ${det}`],
          `The characteristic equation is lambda^2 - (trace)*lambda + det = 0. Here lambda^2 - ${tr}*lambda + ${det} = 0, which factors into (lambda - ${l1})(lambda - ${l2}) = 0. Eigenvalues are ${l1} and ${l2}.`
        ];
      },
      () => {
        const n = randInt(5, 12);
        const edges = (n * (n - 1)) / 2;
        return [
          `In graph theory, what is the total number of edges in a simple complete undirected graph K_${n} containing ${n} vertices?`,
          `${edges} edges`,
          [`${n * (n - 1)} edges`, `${n - 1} edges`, `${edges + n} edges`],
          `A complete graph K_n connects every pair of vertices. The number of edges is n*(n - 1)/2. For n = ${n}, ${n} * ${n - 1} / 2 = ${edges} edges.`
        ];
      },
    ];
    return types[index % types.length]();
  }

  if (canonical === "algorithms") {
    const types = [
      () => {
        const n = randPick([64, 128, 256, 512, 1024]);
        const comps = Math.floor(Math.log2(n)) + 1;
        return [
          `What is the maximum number of key comparisons required to search for an element in a sorted array of size ${n} using Binary Search in the worst case?`,
          `${comps} comparisons`,
          [`${comps - 1} comparisons`, `${comps + 2} comparisons`, `${n / 2} comparisons`],
          `Worst-case comparisons for binary search on size n is floor(log2(n)) + 1. For n = ${n}, floor(log2(${n})) + 1 = ${comps} comparisons.`
        ];
      },
    ];
    return types[index % types.length]();
  }

  if (canonical === "physics") {
    const types = [
      () => {
        const a = randInt(2, 6);
        const t = randInt(3, 8);
        const s = 0.5 * a * t * t;
        return [
          `A vehicle starts from rest (u = 0 m/s) and accelerates uniformly at ${a} m/s² for a duration of ${t} seconds. What is the total distance traveled?`,
          `${s} meters`,
          [`${s + 12} meters`, `${s - 8} meters`, `${a * t} meters`],
          `Using the kinematic equation s = u*t + (1/2)*a*t^2: Since u = 0, s = 0.5 * ${a} * (${t})^2 = 0.5 * ${a} * ${t * t} = ${s} meters.`
        ];
      },
      () => {
        const Tc = randPick([270, 300, 320]);
        const Th = randPick([540, 600, 800]);
        const eff = Math.round((1 - Tc / Th) * 100);
        return [
          `A Carnot heat engine operates between a hot reservoir at ${Th} K and a cold sink at ${Tc} K. What is the maximum theoretical efficiency of this engine?`,
          `${eff}%`,
          [`${eff - 10}%`, `${eff + 8}%`, `${100 - eff}%`],
          `Carnot efficiency eta = 1 - (Tc / Th) = 1 - (${Tc} / ${Th}) = ${(1 - Tc / Th).toFixed(2)} = ${eff}%.`
        ];
      },
      () => {
        const r1 = randPick([6, 10, 12, 20]);
        const r2 = randPick([12, 15, 20, 30]);
        const req = ((r1 * r2) / (r1 + r2)).toFixed(1);
        return [
          `Two electric resistors of ${r1} ohms and ${r2} ohms are connected in parallel across a circuit. What is the equivalent resistance of the combination?`,
          `${req} ohms`,
          [`${r1 + r2} ohms`, `${(Number(req) * 1.5).toFixed(1)} ohms`, `${Math.abs(r1 - r2)} ohms`],
          `For resistors in parallel, 1/Req = 1/R1 + 1/R2 => Req = (R1 * R2) / (R1 + R2) = (${r1} * ${r2}) / (${r1} + ${r2}) = ${req} ohms.`
        ];
      },
    ];
    return types[index % types.length]();
  }

  if (canonical === "chemistry") {
    const types = [
      () => {
        const exp = randInt(2, 5);
        return [
          `What is the pH of an aqueous hydrochloric acid (HCl) solution having a hydronium ion concentration [H+] = 1.0 × 10^-${exp} M at 25°C?`,
          `${exp}`,
          [`${14 - exp}`, `${exp + 1}`, `${exp - 1}`],
          `pH = -log10([H+]). Since [H+] = 10^-${exp} M, pH = -log10(10^-${exp}) = ${exp}.`
        ];
      },
      () => {
        const halfLife = randPick([3, 4, 6, 8]);
        const initialMass = randPick([80, 120, 160, 200]);
        const elapsed = halfLife * 2;
        const remaining = initialMass / 4;
        return [
          `A radioactive isotope has a half-life of ${halfLife} hours. If a laboratory sample initially contains ${initialMass} grams of this isotope, how many grams remain undecayed after ${elapsed} hours?`,
          `${remaining} grams`,
          [`${remaining * 2} grams`, `${remaining / 2} grams`, `${initialMass - remaining * 3} grams`],
          `Number of elapsed half-lives n = ${elapsed} / ${halfLife} = 2. Remaining mass = ${initialMass} / (2^2) = ${initialMass} / 4 = ${remaining} grams.`
        ];
      },
    ];
    return types[index % types.length]();
  }

  if (canonical === "database management systems") {
    const types = [
      () => {
        const rCount = randInt(40, 120);
        const sCount = randInt(5, 25);
        const prod = rCount * sCount;
        return [
          `Relation R contains ${rCount} tuples and relation S contains ${sCount} tuples. In relational algebra, what is the exact number of tuples in the Cartesian product R × S?`,
          `${prod} tuples`,
          [`${rCount + sCount} tuples`, `${prod - rCount} tuples`, `${Math.max(rCount, sCount)} tuples`],
          `The Cartesian product pairs each tuple of R with every tuple of S. Total tuples = |R| * |S| = ${rCount} * ${sCount} = ${prod} tuples.`
        ];
      },
      () => {
        const order = randPick([4, 5, 6, 8]);
        const maxKeys = order - 1;
        return [
          `In a B+ Tree index of order ${order} (where order is the maximum number of child pointers a node can hold), what is the maximum number of search keys an internal node can store?`,
          `${maxKeys} keys`,
          [`${order} keys`, `${order + 1} keys`, `${Math.floor(order / 2)} keys`],
          `In a B+ Tree, a node with p child pointers holds at most p - 1 search keys. For order ${order}, max keys = ${order} - 1 = ${maxKeys} keys.`
        ];
      },
    ];
    return types[index % types.length]();
  }

  if (canonical === "digital logic") {
    const types = [
      () => {
        const inputs = randPick([16, 32, 64, 128]);
        const selectLines = Math.round(Math.log2(inputs));
        return [
          `How many select lines are required to design a ${inputs}-to-1 Multiplexer (MUX)?`,
          `${selectLines} select lines`,
          [`${selectLines - 1} select lines`, `${selectLines + 1} select lines`, `${inputs / 2} select lines`],
          `A 2^n to 1 multiplexer requires n select lines. Since 2^${selectLines} = ${inputs}, exactly ${selectLines} select lines are required.`
        ];
      },
      () => {
        const nFF = randInt(3, 5);
        const clockMHz = randPick([16, 32, 64]);
        const div = Math.pow(2, nFF);
        const outFreq = clockMHz / div;
        return [
          `A cascade of ${nFF} T-flip-flops connected as a ripple counter is supplied with a clock signal of frequency ${clockMHz} MHz. What is the frequency of the output signal from the final flip-flop?`,
          `${outFreq} MHz`,
          [`${outFreq * 2} MHz`, `${clockMHz / nFF} MHz`, `${outFreq / 2} MHz`],
          `Each flip-flop divides the frequency by 2. For ${nFF} flip-flops, division factor = 2^${nFF} = ${div}. Output frequency = ${clockMHz} MHz / ${div} = ${outFreq} MHz.`
        ];
      },
    ];
    return types[index % types.length]();
  }

  if (canonical === "computer organization & architecture") {
    const types = [
      () => {
        const stages = randPick([4, 5, 6]);
        const instrs = randPick([100, 200, 500]);
        const cycles = stages + instrs - 1;
        return [
          `An instruction pipeline consists of ${stages} stages without branches or data hazards. How many clock cycles are required to completely execute ${instrs} independent instructions?`,
          `${cycles} clock cycles`,
          [`${stages * instrs} clock cycles`, `${cycles + stages} clock cycles`, `${instrs} clock cycles`],
          `In an ideal k-stage pipeline, the first instruction takes k cycles, and each subsequent instruction takes 1 cycle. Total cycles = k + n - 1 = ${stages} + ${instrs} - 1 = ${cycles} cycles.`
        ];
      },
    ];
    return types[index % types.length]();
  }

  if (canonical === "theory of computation") {
    const types = [
      () => {
        const k = randInt(2, 5);
        const states = k + 1;
        return [
          `What is the minimum number of states in a Deterministic Finite Automaton (DFA) that accepts all binary strings ending with a specific fixed sequence of ${k} bits?`,
          `${states} states`,
          [`${k} states`, `${Math.pow(2, k)} states`, `${2 * k} states`],
          `To recognize an exact ending pattern of length k over {0, 1}, a minimal DFA requires k + 1 states (tracking prefixes from length 0 to k).`
        ];
      },
    ];
    return types[index % types.length]();
  }

  if (canonical === "data structures") {
    const types = [
      () => {
        const h = randInt(3, 6);
        const maxNodes = Math.pow(2, h + 1) - 1;
        const leafNodes = Math.pow(2, h);
        return [
          `For a full binary tree of height ${h} (where the height of the root node is 0), what is the maximum number of nodes and leaf nodes respectively?`,
          `${maxNodes} total nodes, ${leafNodes} leaf nodes`,
          [`${maxNodes - 1} total nodes, ${leafNodes - 1} leaf nodes`, `${Math.pow(2, h)} total nodes, ${h * 2} leaf nodes`, `${maxNodes * 2} total nodes, ${leafNodes} leaf nodes`],
          `Total nodes in a full binary tree of height h = 2^(h + 1) - 1 = 2^${h + 1} - 1 = ${maxNodes}. The number of leaves = 2^h = ${leafNodes}.`
        ];
      },
    ];
    return types[index % types.length]();
  }

  // Fallback Aptitude
  const d1 = randInt(10, 20);
  const d2 = randInt(20, 30);
  const together = ((d1 * d2) / (d1 + d2)).toFixed(1);
  return [
    `Worker A can finish a project in ${d1} days, while Worker B can finish the same project in ${d2} days. If both work together, how many days will they take to complete the project?`,
    `${together} days`,
    [`${(Number(together) + 2.5).toFixed(1)} days`, `${(Number(together) - 1.2).toFixed(1)} days`, `${((d1 + d2) / 2).toFixed(1)} days`],
    `Combined rate = 1/${d1} + 1/${d2} = (${d1 + d2})/(${d1 * d2}). Days required = (${d1} * ${d2}) / (${d1} + ${d2}) = ${together} days.`
  ];
}

export async function generateQuiz(req, res) {
  const { sourceType = "topic", topic = "Operating Systems", text = "", examSlug = "", count = 5, lang = "en" } = req.body || {};
  const requestedCount = Math.min(20, Math.max(5, Number(count) || 5));
  const normalizedLang = ["en", "ta"].includes(lang) ? lang : "en";

  let selectedQuestions = [];

  if (sourceType === "notes" && text && text.trim().length > 20) {
    // Generate quiz strictly from user notes/uploaded document
    const sentences = text
      .split(/[.?!;\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 25);

    const questions = [];
    for (let i = 0; i < Math.min(sentences.length, requestedCount); i++) {
      const sentence = sentences[i];
      const words = sentence.split(/\s+/).filter((w) => w.length > 4);
      const targetWord = words[Math.floor(words.length / 2)] || "concept";
      const blankedSentence = sentence.replace(new RegExp(`\\b${targetWord}\\b`, "i"), "_______");

      questions.push(
        createQuestion(
          `notes-q-${i + 1}-${Date.now()}`,
          `[From Your Uploaded Notes] Complete the principle: "${blankedSentence}"`,
          targetWord,
          [
            `Alternative: ${words[0] || "Variable"}`,
            `Counterpart: ${words[words.length - 1] || "Constraint"}`,
            "Non-standard exception",
          ],
          `Explanation grounded in your uploaded text: The exact sentence states: "${sentence}". Hence "${targetWord}" correctly satisfies the principle.`
        )
      );
    }

    selectedQuestions = questions;
  } else {
    // Strict Topic Specificity with Procedural + Sampled Dynamic Generation
    const canonical = resolveCanonicalTopic(topic);
    const langBank = QUESTION_BANK[normalizedLang] || QUESTION_BANK.en;
    // Strictly scoped: NO fallback to operating systems for other subjects!
    const questionsForTopic = langBank[canonical] || QUESTION_BANK.en[canonical] || [];

    // Procedurally generated unique questions tailored to the requested topic
    const proceduralCount = Math.min(requestedCount, 3);
    const proceduralQuestions = [];
    for (let i = 0; i < proceduralCount; i++) {
      const raw = generateProceduralQuestion(canonical, i + Date.now(), normalizedLang);
      proceduralQuestions.push(createQuestion(`proc-${canonical}-${Date.now()}-${i}`, raw[0], raw[1], raw[2], raw[3]));
    }

    // Static pool sampled randomly from the exact topic
    const pool = questionsForTopic.map((item, idx) =>
      createQuestion(`${normalizedLang}-${canonical}-${idx}-${Date.now()}`, item[0], item[1], item[2], item[3])
    );
    const shuffledBank = shuffleArray(pool);

    // Merge procedural + shuffled bank to guarantee fresh question sets on every click
    selectedQuestions = [...proceduralQuestions, ...shuffledBank].slice(0, requestedCount);

    if (selectedQuestions.length < requestedCount) {
      const needed = requestedCount - selectedQuestions.length;
      for (let j = 0; j < needed; j++) {
        const extra = generateProceduralQuestion(canonical, j + 10, normalizedLang);
        selectedQuestions.push(createQuestion(`proc-extra-${canonical}-${Date.now()}-${j}`, extra[0], extra[1], extra[2], extra[3]));
      }
    }
  }

  return res.json({
    title: `${topic} Practice Quiz (${normalizedLang.toUpperCase()})`,
    sourceType,
    topic,
    examSlug,
    lang: normalizedLang,
    questions: selectedQuestions,
  });
}

export async function recordQuizAttempt(req, res) {
  const {
    examSlug = "",
    examName = "",
    subjectName = "",
    chapterName = "",
    topic = "",
    quizTitle = "Practice Quiz",
    sourceType = "topic",
    totalQuestions = 5,
    score = 0,
    questions = [],
  } = req.body || {};

  const total = Number(totalQuestions) || (questions ? questions.length : 5);
  const correct = Number(score) || 0;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  const attempt = await QuizAttempt.create({
    user: req.user._id,
    examSlug,
    examName,
    subjectName,
    chapterName,
    topic,
    quizTitle,
    sourceType,
    totalQuestions: total,
    score: correct,
    percentage,
    questions: (questions || []).map((q) => ({
      question: q.question,
      options: q.options,
      selectedAnswer: q.selectedAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect: q.isCorrect,
    })),
  });

  // Automatically update Progress streaks & daily logs for student
  try {
    if (examSlug) {
      const progressDoc = await Progress.findOne({ user: req.user._id, examSlug });
      if (progressDoc) {
        const today = new Date().toISOString().slice(0, 10);
        if (!progressDoc.studyDays.includes(today)) {
          progressDoc.studyDays.push(today);
        }
        progressDoc.dailyLogs.push({
          date: today,
          action: `Completed Practice Quiz: ${quizTitle || topic}`,
          details: `Score: ${correct}/${total} (${percentage}%) · ${subjectName || "Subject Drill"}`,
          timestamp: new Date(),
        });
        await progressDoc.save();
      }
    }
  } catch {}

  res.status(201).json({ attempt });
}

export async function listQuizAttempts(req, res) {
  const filter = { user: req.user._id };
  if (req.query.topic) filter.topic = req.query.topic;
  if (req.query.examSlug) filter.examSlug = req.query.examSlug;

  const attempts = await QuizAttempt.find(filter).sort({ attemptedAt: -1 }).limit(100);
  res.json({ attempts });
}
