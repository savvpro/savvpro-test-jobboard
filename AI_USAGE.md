# AI Usage Documentation - JobBoard Pro

## Tool Used
- **Antigravity** (Powered by Google DeepMind)

## Verbatim Prompts

### Prompt 1
"Assessment Test — JobBoard Pro: Job Listings, Applications & Status Workflow ... ab yeh is new folder jo dia ha tmhy usii ma yeh sara code kro iske according"

### Prompt 2
"yesh plz krdo ab meri instructuion ke according..."

### Prompt 3
"acha kia tmne github pr bhi push kr dia ha code...? or dosri bat yeh ha ke project ko run krne ki sarii commancds do mujy.."

### Prompt 4
"yha dikh q nahi rhii mujy dataase...or aisa kro phle login or sign up bnao or agr recruiter hna to woh post kry or application wagera daikh sky students kii ..baaki jo kaam hain unkii instructions ke according woh wse hii rkho bs login or signup ke according unka kaam kro..."

### Prompt 5
"acha ab aisa kro login signup khtm krdo or jo mne instrucion bhjii hain bs wohii ffollow kro or sara uske accrding hi bna krdo tm mujy...or sth ma yh database ka table bhi open kr ke dikhao .."

## AI Errors and Corrections

### 1. Pydantic V2 Compatibility
- **Error**: Initial backend implementation used `orm_mode = True` and `@validator`, which are deprecated in Pydantic V2 (the version installed on the user's system), causing warnings and runtime errors.
- **Correction**: Updated `schemas.py` to use `model_config = ConfigDict(from_attributes=True)` and `@field_validator` to ensure full compatibility with the latest Pydantic version.

### 2. Client-Side Hook in Server Component
- **Error**: The `useAuth` hook was initially used inside `layout.tsx` without marking it as a client component, leading to a "useAuth is not a function" error because server components cannot consume context.
- **Correction**: Extracted the navigation logic into a separate `Navbar.tsx` client component and updated `layout.tsx` to remain a server component for metadata while importing the client navbar. (Later removed when authentication was reverted).

### 3. Pytest Import Errors
- **Error**: Pytest was unable to find the `backend` modules during test collection because the backend directory was not in the Python path, and the imports in `main.py` were absolute.
- **Correction**: Added a `sys.path.insert` call at the top of `tests/test_backend.py` to include the backend directory and updated imports to ensure consistency across the test environment.

### 4. SQLite File Locking (Windows)
- **Error**: Running tests on Windows caused `PermissionError: [WinError 32]` when trying to delete the test database file because the SQLite connection was still holding a lock.
- **Correction**: Switched the test database to an in-memory SQLite instance (`sqlite:///:memory:`) using `StaticPool` to ensure isolation and avoid file system locking issues on Windows.
