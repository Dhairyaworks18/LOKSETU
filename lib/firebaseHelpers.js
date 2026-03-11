import { db, storage } from "./firebase";
import { collection, addDoc, getDocs, updateDoc, doc, increment, query, orderBy, getDoc, arrayUnion, arrayRemove, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function fetchReports() {
    try {
        const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(docSnap => {
            const data = docSnap.data();

            let progressStep = 1;
            const status = data.status || "submitted";
            if (status === "progress") progressStep = 3;
            else if (status === "resolved") progressStep = 4;

            let timeAgo = data.time || "Just now";
            if (data.createdAt && typeof data.createdAt.toDate === 'function') {
                const diffMs = new Date() - data.createdAt.toDate();
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                if (diffDays > 0) {
                    timeAgo = `${diffDays} days ago`;
                }
            }

            return {
                id: docSnap.id,
                ...data,
                status: status === "progress" ? "IN PROGRESS" : status === "resolved" ? "RESOLVED" : "SUBMITTED",
                progressStep,
                icon: data.emoji && data.emoji.startsWith('http') ? data.emoji : (data.emoji === '🚗' || data.issue_type === 'Pothole' ? 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Hole.png' : data.emoji === '💡' || data.issue_type === 'Broken Streetlight' ? 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Light%20Bulb.png' : data.emoji === '🗑️' || data.issue_type === 'Garbage' ? 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Wastebasket.png' : data.emoji === '💧' || data.issue_type === 'Water Logging' ? 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Droplet.png' : 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Memo.png'),
                type: data.issue_type || "Other",
                upvotes: data.votes || 0,
                timeAgo,
                photo: data.photo || "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=500&q=80",
                city: data.location?.split(',')[0] || "Unknown",
                state: data.state || "",
                lat: data.lat ?? null,
                lng: data.lng ?? null
            };
        });
    } catch (err) {
        console.error("fetchReports error:", err);
        return [];
    }
}

export async function submitReport({ title, description, issue_type, location, state, reporter, userId, is_anonymous, emoji, photoFile, lat, lng }) {
    try {
        let photoURL = "";
        if (photoFile) {
            const filename = `reports/${Date.now()}_${photoFile.name || "photo.jpg"}`;
            const fileRef = ref(storage, filename);
            await uploadBytes(fileRef, photoFile);
            photoURL = await getDownloadURL(fileRef);
        }

        await addDoc(collection(db, "reports"), {
            title,
            description,
            issue_type,
            location,
            state: state || "",
            reporter,
            userId: userId || null,
            is_anonymous: !!is_anonymous,
            emoji: emoji || "📝",
            photo: photoURL,
            status: "submitted",
            badgeText: "SUBMITTED",
            votes: 0,
            lat: lat ?? null,
            lng: lng ?? null,
            createdAt: new Date(),
            time: "Just now"
        });
    } catch (err) {
        console.error("submitReport error:", err);
        throw err;
    }
}

/**
 * Toggle upvote for a report.
 * - If the user has NOT upvoted: adds +1 and records their uid.
 * - If the user HAS already upvoted: removes -1 and removes their uid.
 * Returns true if the user has now upvoted, false if they removed their upvote.
 */
export async function upvoteReport(reportId, userId) {
    if (!userId) return false;
    try {
        const reportRef = doc(db, "reports", reportId);
        const snapshot = await getDoc(reportRef);
        if (!snapshot.exists()) return false;

        const data = snapshot.data();
        const upvotedBy = Array.isArray(data.upvotedBy) ? data.upvotedBy : [];
        const alreadyUpvoted = upvotedBy.includes(userId);

        if (alreadyUpvoted) {
            // Remove upvote
            await updateDoc(reportRef, {
                votes: increment(-1),
                upvotedBy: arrayRemove(userId)
            });
            return false;
        } else {
            // Add upvote
            await updateDoc(reportRef, {
                votes: increment(1),
                upvotedBy: arrayUnion(userId)
            });
            return true;
        }
    } catch (err) {
        console.error("upvoteReport error:", err);
        throw err;
    }
}

/**
 * Delete a report filed by the current user.
 * Only the owner (matching userId) can delete their own report.
 */
export async function deleteReport(reportId, userId) {
    if (!userId || !reportId) throw new Error("Missing reportId or userId");
    try {
        const reportRef = doc(db, "reports", reportId);
        const snapshot = await getDoc(reportRef);
        if (!snapshot.exists()) throw new Error("Report not found");

        const data = snapshot.data();
        // Guard: only the owner can delete
        if (data.userId !== userId) {
            throw new Error("You are not authorized to delete this report");
        }

        await deleteDoc(reportRef);
    } catch (err) {
        console.error("deleteReport error:", err);
        throw err;
    }
}
