import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def generate_class_diagram(filepath="class_diagram.png"):
    fig, ax = plt.subplots(figsize=(14, 11), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Color scheme
    header_color = '#1e3a8a' # dark blue
    field_color = '#f8fafc' # light slate
    border_color = '#334155' # dark slate

    def draw_class(x, y, w, h, title, fields, methods):
        # Header box
        hdr_h = h * 0.22
        body_h = h - hdr_h
        rect_hdr = patches.Rectangle((x, y + body_h), w, hdr_h, facecolor=header_color, edgecolor=border_color, linewidth=1.5)
        rect_body = patches.Rectangle((x, y), w, body_h, facecolor=field_color, edgecolor=border_color, linewidth=1.5)
        ax.add_patch(rect_body)
        ax.add_patch(rect_hdr)
        
        ax.text(x + w/2, y + body_h + hdr_h/2, title, color='white', weight='bold', fontsize=9, ha='center', va='center', fontfamily='serif')
        
        # Text fields
        field_text = "\n".join(fields)
        ax.text(x + 1, y + body_h - 1, field_text, color='#0f172a', fontsize=7, ha='left', va='top', fontfamily='monospace')
        
        # Divider line if methods exist
        if methods:
            div_y = y + (len(methods) * 2.2) + 1
            ax.plot([x, x + w], [div_y, div_y], color=border_color, linewidth=0.8)
            method_text = "\n".join(methods)
            ax.text(x + 1, div_y - 1, method_text, color='#1e293b', fontsize=6.8, ha='left', va='top', fontfamily='monospace', fontstyle='italic')

    # 1. User Class (Center Top)
    draw_class(38, 76, 24, 21, "User (Base Model)", 
               ["+ id: ObjectId", "+ studentId: String", "+ name: String", "+ email: String", "+ role: RoleEnum", "+ authProvider: String", "+ registeredExams: [String]", "+ bookmarkedResources: [ObjectId]"],
               ["+ register(): User", "+ authenticate(): Token", "+ toggleBookmark(): void"])

    # 2. Student (Derived)
    draw_class(8, 78, 22, 18, "Student (Role: student)",
               ["+ userRef: ObjectId", "+ enrolledExams: [String]", "+ targetYear: Number", "+ currentStreak: Number", "+ mockScores: [MockScore]"],
               ["+ enrollExam(): void", "+ recordAttempt(): void", "+ donateBook(): void"])

    # 3. DeliveryPartner (Derived)
    draw_class(70, 78, 22, 18, "DeliveryPartner (Role: delivery)",
               ["+ userRef: ObjectId", "+ vehicleNumber: String", "+ activeZone: String", "+ assignedOrders: [ObjectId]", "+ activePickups: [ObjectId]"],
               ["+ acceptOrder(): void", "+ updatePickupStatus(): void", "+ completeDelivery(): void"])

    # 4. Exam Model (Left Mid)
    draw_class(6, 46, 26, 24, "Exam",
               ["+ id: ObjectId", "+ slug: String (PK)", "+ name: String", "+ category: String", "+ authority: String", "+ eligibility: String", "+ officialUrl: String", "+ subjects: [Subject]"],
               ["+ getSyllabus(): Tree", "+ addSubject(): void", "+ getMockLinks(): [Url]"])

    # 5. Progress Model (Center Mid)
    draw_class(38, 46, 24, 24, "Progress",
               ["+ id: ObjectId", "+ user: ObjectId (FK)", "+ examSlug: String (FK)", "+ topicStatus: Map<id, Status>", "+ studyDays: [Date]", "+ overallScore: Number", "+ totalAttempts: Number"],
               ["+ updateTopicStatus(): void", "+ computeCompletion(): Float", "+ getAnalyticsSummary(): Data"])

    # 6. MockAttempt Model (Right Mid)
    draw_class(70, 46, 24, 24, "MockAttempt",
               ["+ id: ObjectId", "+ user: ObjectId (FK)", "+ examSlug: String (FK)", "+ subjectName: String", "+ chapterName: String", "+ topicId: String", "+ score: Number", "+ maxScore: Number", "+ percentage: Float", "+ createdAt: DateTime"],
               ["+ logAttempt(): MockAttempt", "+ getTopicProgression(): Array", "+ getBestScore(): Number"])

    # 7. Marketplace Product (Left Bottom)
    draw_class(6, 12, 26, 26, "Product (Marketplace)",
               ["+ id: ObjectId", "+ title: String", "+ examSlug: String", "+ subjectName: String", "+ price: Number", "+ condition: ConditionEnum", "+ stock: Number", "+ isDonation: Boolean", "+ seller: ObjectId (FK)", "+ imageUrl: String"],
               ["+ listProduct(): Product", "+ markAsDonated(): void", "+ updateStock(): Boolean"])

    # 8. Order (Center Bottom)
    draw_class(38, 12, 24, 26, "Order",
               ["+ id: ObjectId", "+ trackingId: String", "+ buyer: ObjectId (FK)", "+ items: [OrderItem]", "+ totalAmount: Number", "+ status: OrderStatusEnum", "+ deliveryAddress: Address", "+ assignedPartner: ObjectId (FK)", "+ createdAt: DateTime"],
               ["+ createOrder(): Order", "+ trackStatus(): StatusInfo", "+ assignDelivery(): void"])

    # 9. ReturnRequest / Donation (Right Bottom)
    draw_class(70, 12, 24, 26, "ReturnRequest / Donation",
               ["+ id: ObjectId", "+ trackingId: String", "+ user: ObjectId (FK)", "+ type: RequestTypeEnum", "+ item: BookItemRef", "+ condition: String", "+ pickupAddress: String", "+ status: ReturnStatusEnum", "+ assignedCourier: ObjectId (FK)"],
               ["+ submitRequest(): Request", "+ schedulePickup(): void", "+ verifyItemQuality(): void"])

    # Connections / Associations
    arrow_props = dict(arrowstyle="->", color="#475569", lw=1.5)
    
    # User -> Student & Delivery
    ax.annotate("", xy=(30, 85), xytext=(38, 85), arrowprops=arrow_props)
    ax.annotate("", xy=(70, 85), xytext=(62, 85), arrowprops=arrow_props)
    
    # User -> Progress & MockAttempt
    ax.annotate("", xy=(50, 70), xytext=(50, 76), arrowprops=arrow_props)
    ax.annotate("", xy=(82, 70), xytext=(82, 78), arrowprops=arrow_props)

    # Exam -> Progress
    ax.annotate("", xy=(38, 58), xytext=(32, 58), arrowprops=arrow_props)

    # Progress -> MockAttempt
    ax.annotate("", xy=(70, 58), xytext=(62, 58), arrowprops=arrow_props)

    # User -> Order & ReturnRequest
    ax.annotate("", xy=(50, 38), xytext=(50, 46), arrowprops=arrow_props)
    ax.annotate("", xy=(82, 38), xytext=(82, 46), arrowprops=arrow_props)

    # Product -> Order
    ax.annotate("", xy=(38, 25), xytext=(32, 25), arrowprops=arrow_props)

    # Relationship labels
    ax.text(34, 86, "inherits", fontsize=7, color="#64748b", fontfamily='serif')
    ax.text(64, 86, "inherits", fontsize=7, color="#64748b", fontfamily='serif')
    ax.text(51, 73, "1 : N", fontsize=7.5, weight='bold', color="#1e3a8a", fontfamily='serif')
    ax.text(34, 59, "1 : N", fontsize=7.5, weight='bold', color="#1e3a8a", fontfamily='serif')
    ax.text(65, 59, "1 : N", fontsize=7.5, weight='bold', color="#1e3a8a", fontfamily='serif')
    ax.text(34, 26, "contains", fontsize=7, color="#64748b", fontfamily='serif')

    plt.tight_layout()
    plt.savefig(filepath, bbox_inches='tight')
    plt.close()
    print(f"Class diagram saved to {filepath}")

def generate_er_diagram(filepath="er_diagram.png"):
    fig, ax = plt.subplots(figsize=(14, 11), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ent_color = '#0284c7' # sky blue
    rel_color = '#d97706' # amber
    attr_color = '#f1f5f9' # slate 100

    def draw_entity(x, y, w, h, name):
        rect = patches.FancyBboxPatch((x, y), w, h, boxstyle="square,pad=0", facecolor=ent_color, edgecolor='#0369a1', linewidth=1.8)
        ax.add_patch(rect)
        ax.text(x + w/2, y + h/2, name, color='white', weight='bold', fontsize=9, ha='center', va='center', fontfamily='serif')

    def draw_relation(cx, cy, rx, ry, name):
        diamond = patches.Polygon([[cx, cy + ry], [cx + rx, cy], [cx, cy - ry], [cx - rx, cy]], facecolor=rel_color, edgecolor='#b45309', linewidth=1.5)
        ax.add_patch(diamond)
        ax.text(cx, cy, name, color='white', weight='bold', fontsize=7.5, ha='center', va='center', fontfamily='serif')

    def draw_attribute(cx, cy, rx, ry, text, is_pk=False):
        ellipse = patches.Ellipse((cx, cy), rx*2, ry*2, facecolor=attr_color, edgecolor='#475569', linewidth=1.2)
        ax.add_patch(ellipse)
        style = 'underline' if is_pk else 'normal'
        ax.text(cx, cy, text, color='#0f172a', fontsize=7, ha='center', va='center', fontfamily='serif', fontstyle='italic' if not is_pk else 'normal', weight='bold' if is_pk else 'normal')

    # Central Entity: USER
    draw_entity(42, 60, 16, 8, "USER")
    # Attributes for USER
    draw_attribute(32, 75, 6, 2.5, "student_id", is_pk=True)
    draw_attribute(44, 76, 5.5, 2.5, "name")
    draw_attribute(56, 76, 5.5, 2.5, "email")
    draw_attribute(66, 74, 5, 2.5, "role")
    ax.plot([36, 44], [73, 68], color='#64748b', lw=1)
    ax.plot([46, 48], [73.5, 68], color='#64748b', lw=1)
    ax.plot([54, 52], [73.5, 68], color='#64748b', lw=1)
    ax.plot([63, 56], [72, 68], color='#64748b', lw=1)

    # Entity: EXAM
    draw_entity(8, 60, 16, 8, "EXAM")
    draw_attribute(6, 74, 5.5, 2.5, "slug", is_pk=True)
    draw_attribute(18, 75, 5.5, 2.5, "name")
    draw_attribute(20, 81, 6, 2.5, "authority")
    ax.plot([8, 12], [71.5, 68], color='#64748b', lw=1)
    ax.plot([16, 16], [72.5, 68], color='#64748b', lw=1)
    ax.plot([19, 19], [78.5, 68], color='#64748b', lw=1)

    # Relationship: ENROLLS_IN (Exam <-> User)
    draw_relation(31, 64, 5, 3.5, "Registers")
    ax.plot([24, 26], [64, 64], color='#334155', lw=1.5)
    ax.plot([36, 42], [64, 64], color='#334155', lw=1.5)
    ax.text(25, 65.5, "M", fontsize=8, weight='bold', color='#1e3a8a')
    ax.text(40, 65.5, "N", fontsize=8, weight='bold', color='#1e3a8a')

    # Entity: PROGRESS
    draw_entity(10, 32, 16, 8, "PROGRESS")
    draw_attribute(6, 22, 5.5, 2.5, "progress_id", is_pk=True)
    draw_attribute(18, 21, 6, 2.5, "topic_status")
    draw_attribute(22, 26, 6, 2.5, "study_days")
    ax.plot([8, 14], [24.5, 32], color='#64748b', lw=1)
    ax.plot([18, 18], [23.5, 32], color='#64748b', lw=1)

    # Relationship: TRACKS (User <-> Progress)
    draw_relation(31, 44, 5, 3.5, "Tracks")
    ax.plot([44, 34], [60, 47], color='#334155', lw=1.5)
    ax.plot([28, 20], [42, 40], color='#334155', lw=1.5)
    ax.text(42, 54, "1", fontsize=8, weight='bold', color='#1e3a8a')
    ax.text(24, 43, "N", fontsize=8, weight='bold', color='#1e3a8a')

    # Entity: MOCK_ATTEMPT
    draw_entity(76, 60, 18, 8, "MOCK_ATTEMPT")
    draw_attribute(74, 75, 5.5, 2.5, "attempt_id", is_pk=True)
    draw_attribute(86, 75, 5.5, 2.5, "score")
    draw_attribute(92, 69, 5.5, 2.5, "percentage")
    ax.plot([76, 80], [72.5, 68], color='#64748b', lw=1)
    ax.plot([85, 85], [72.5, 68], color='#64748b', lw=1)
    ax.plot([89, 88], [67, 68], color='#64748b', lw=1)

    # Relationship: ATTEMPTS (User <-> MockAttempt)
    draw_relation(67, 64, 5, 3.5, "Takes")
    ax.plot([58, 62], [64, 64], color='#334155', lw=1.5)
    ax.plot([72, 76], [64, 64], color='#334155', lw=1.5)
    ax.text(60, 65.5, "1", fontsize=8, weight='bold', color='#1e3a8a')
    ax.text(74, 65.5, "N", fontsize=8, weight='bold', color='#1e3a8a')

    # Entity: PRODUCT (Marketplace)
    draw_entity(74, 32, 18, 8, "PRODUCT")
    draw_attribute(72, 21, 5.5, 2.5, "product_id", is_pk=True)
    draw_attribute(84, 21, 5.5, 2.5, "price")
    draw_attribute(90, 26, 5.5, 2.5, "condition")
    draw_attribute(92, 33, 5.5, 2.5, "is_donation")
    ax.plot([74, 78], [23.5, 32], color='#64748b', lw=1)
    ax.plot([84, 84], [23.5, 32], color='#64748b', lw=1)

    # Relationship: LISTS (User <-> Product)
    draw_relation(67, 46, 5, 3.5, "Lists/Sells")
    ax.plot([56, 64], [60, 48], color='#334155', lw=1.5)
    ax.plot([70, 78], [44, 40], color='#334155', lw=1.5)
    ax.text(58, 54, "1", fontsize=8, weight='bold', color='#1e3a8a')
    ax.text(76, 44, "N", fontsize=8, weight='bold', color='#1e3a8a')

    # Entity: ORDER
    draw_entity(42, 12, 16, 8, "ORDER")
    draw_attribute(32, 3, 5.5, 2.5, "order_id", is_pk=True)
    draw_attribute(44, 3, 5.5, 2.5, "tracking_id")
    draw_attribute(56, 3, 5.5, 2.5, "status")
    draw_attribute(66, 6, 5.5, 2.5, "total_amt")
    ax.plot([36, 44], [5.5, 12], color='#64748b', lw=1)
    ax.plot([46, 48], [5.5, 12], color='#64748b', lw=1)
    ax.plot([54, 52], [5.5, 12], color='#64748b', lw=1)

    # Relationship: PLACES (User <-> Order)
    draw_relation(50, 36, 5, 3.5, "Places")
    ax.plot([50, 50], [60, 39.5], color='#334155', lw=1.5)
    ax.plot([50, 50], [32.5, 20], color='#334155', lw=1.5)
    ax.text(51, 48, "1", fontsize=8, weight='bold', color='#1e3a8a')
    ax.text(51, 26, "N", fontsize=8, weight='bold', color='#1e3a8a')

    # Relationship: CONTAINS (Order <-> Product)
    draw_relation(63, 20, 5, 3.5, "Contains")
    ax.plot([58, 60], [16, 18], color='#334155', lw=1.5)
    ax.plot([66, 74], [22, 32], color='#334155', lw=1.5)
    ax.text(59, 18, "M", fontsize=8, weight='bold', color='#1e3a8a')
    ax.text(71, 27, "N", fontsize=8, weight='bold', color='#1e3a8a')

    plt.tight_layout()
    plt.savefig(filepath, bbox_inches='tight')
    plt.close()
    print(f"ER diagram saved to {filepath}")

if __name__ == "__main__":
    generate_class_diagram()
    generate_er_diagram()
