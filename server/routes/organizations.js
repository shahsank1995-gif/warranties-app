const express = require('express');
const router = express.Router();
const db = require('../database');
const crypto = require('crypto');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 100);
}

function generateInviteToken() {
    return crypto.randomBytes(32).toString('hex');
}

// ============================================
// ORGANIZATIONS
// =============================

// Create organization
router.post('/', async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return next(new AppError('Unauthorized', 401));
        }

        const { name, industry, size } = req.body;

        if (!name || name.trim().length < 2) {
            return next(new AppError('Organization name is required', 400));
        }

        let slug = generateSlug(name);

        // Ensure unique slug
        let counter = 1;
        let uniqueSlug = slug;
        while (true) {
            const existing = await db.get('SELECT id FROM organizations WHERE slug = ?', [uniqueSlug]);
            if (!existing) break;
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        // Create organization
        const orgId = crypto.randomUUID();
        await db.run(
            `INSERT INTO organizations (id, name, slug, industry, size, created_at)
             VALUES (?, ?, ?, ?, ?, datetime('now'))`,
            [orgId, name.trim(), uniqueSlug, industry || null, size || 'small']
        );

        // Add creator as owner
        await db.run(
            `INSERT INTO organization_members (organization_id, user_id, role, joined_at)
             VALUES (?, ?, 'owner', datetime('now'))`,
            [orgId, userId]
        );

        logger.info('Organization created', { orgId, name, userId });

        res.json({
            success: true,
            data: {
                id: orgId,
                name,
                slug: uniqueSlug,
                industry,
                size,
                role: 'owner'
            }
        });
    } catch (error) {
        next(error);
    }
});

// List user's organizations
router.get('/', async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return next(new AppError('Unauthorized', 401));
        }

        const orgs = await db.all(
            `SELECT 
                o.id, o.name, o.slug, o.industry, o.size, o.logo_url,
                o.subscription_tier, o.subscription_status,
                om.role, om.department, om.joined_at
             FROM organizations o
             INNER JOIN organization_members om ON o.id = om.organization_id
             WHERE om.user_id = ?
             ORDER BY om.joined_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: orgs
        });
    } catch (error) {
        next(error);
    }
});

// Get organization details
router.get('/:id', async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;

        if (!userId) {
            return next(new AppError('Unauthorized', 401));
        }

        // Check membership
        const member = await db.get(
            `SELECT role FROM organization_members 
             WHERE organization_id = ? AND user_id = ?`,
            [id, userId]
        );

        if (!member) {
            return next(new AppError('Not a member of this organization', 403));
        }

        const org = await db.get(
            'SELECT * FROM organizations WHERE id = ?',
            [id]
        );

        if (!org) {
            return next(new AppError('Organization not found', 404));
        }

        res.json({
            success: true,
            data: {
                ...org,
                role: member.role
            }
        });
    } catch (error) {
        next(error);
    }
});

// Update organization
router.put('/:id', async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;
        const { name, industry, size, logo_url } = req.body;

        if (!userId) {
            return next(new AppError('Unauthorized', 401));
        }

        // Check if user is admin or owner
        const member = await db.get(
            `SELECT role FROM organization_members 
             WHERE organization_id = ? AND user_id = ?`,
            [id, userId]
        );

        if (!member || !['owner', 'admin'].includes(member.role)) {
            return next(new AppError('Insufficient permissions', 403));
        }

        await db.run(
            `UPDATE organizations 
             SET name = COALESCE(?, name),
                 industry = COALESCE(?, industry),
                 size = COALESCE(?, size),
                 logo_url = COALESCE(?, logo_url),
                 updated_at = datetime('now')
             WHERE id = ?`,
            [name, industry, size, logo_url, id]
        );

        logger.info('Organization updated', { orgId: id, userId });

        res.json({ success: true, message: 'Organization updated' });
    } catch (error) {
        next(error);
    }
});

// ============================================
// TEAM MANAGEMENT
// ============================================

// List organization members
router.get('/:id/members', async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;

        if (!userId) {
            return next(new AppError('Unauthorized', 401));
        }

        // Check membership
        const isMember = await db.get(
            `SELECT id FROM organization_members 
             WHERE organization_id = ? AND user_id = ?`,
            [id, userId]
        );

        if (!isMember) {
            return next(new AppError('Not a member of this organization', 403));
        }

        const members = await db.all(
            `SELECT user_id, role, department, job_title, joined_at, last_active_at
             FROM organization_members
             WHERE organization_id = ?
             ORDER BY joined_at ASC`,
            [id]
        );

        res.json({
            success: true,
            data: members
        });
    } catch (error) {
        next(error);
    }
});

// Invite team member
router.post('/:id/invite', async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;
        const { email, role, department } = req.body;

        if (!userId) {
            return next(new AppError('Unauthorized', 401));
        }

        // Validate
        if (!email || !role) {
            return next(new AppError('Email and role are required', 400));
        }

        if (!['admin', 'manager', 'member', 'viewer'].includes(role)) {
            return next(new AppError('Invalid role', 400));
        }

        // Check permissions (admin or owner can invite)
        const member = await db.get(
            `SELECT role FROM organization_members 
             WHERE organization_id = ? AND user_id = ?`,
            [id, userId]
        );

        if (!member || !['owner', 'admin'].includes(member.role)) {
            return next(new AppError('Insufficient permissions', 403));
        }

        // Check if user is already a member
        const existing = await db.get(
            `SELECT id FROM organization_members 
             WHERE organization_id = ? AND user_id = ?`,
            [id, email] // Assuming email is used as user_id
        );

        if (existing) {
            return next(new AppError('User is already a member', 400));
        }

        // Check for existing pending invitation
        const pendingInvite = await db.get(
            `SELECT id FROM invitations 
             WHERE organization_id = ? AND email = ? AND accepted_at IS NULL AND expires_at > datetime('now')`,
            [id, email]
        );

        if (pendingInvite) {
            return next(new AppError('Invitation already sent', 400));
        }

        // Create invitation
        const token = generateInviteToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await db.run(
            `INSERT INTO invitations (organization_id, email, role, department, invited_by, token, expires_at, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
            [id, email.toLowerCase(), role, department || null, userId, token, expiresAt.toISOString()]
        );

        logger.info('Invitation sent', { orgId: id, email, role, invitedBy: userId });

        // TODO: Send email with invitation link
        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${token}`;

        res.json({
            success: true,
            message: 'Invitation sent',
            data: {
                email,
                role,
                inviteLink, // Will be removed in production, sent via email only
                expiresAt
            }
        });
    } catch (error) {
        next(error);
    }
});

// Update member role
router.put('/:id/members/:userId', async (req, res, next) => {
    try {
        const requesterId = req.headers['x-user-id'];
        const { id, userId } = req.params;
        const { role, department } = req.body;

        if (!requesterId) {
            return next(new AppError('Unauthorized', 401));
        }

        // Check requester permissions
        const requester = await db.get(
            `SELECT role FROM organization_members 
             WHERE organization_id = ? AND user_id = ?`,
            [id, requesterId]
        );

        if (!requester || !['owner', 'admin'].includes(requester.role)) {
            return next(new AppError('Insufficient permissions', 403));
        }

        // Cannot change owner role (only one owner allowed)
        const targetMember = await db.get(
            `SELECT role FROM organization_members 
             WHERE organization_id = ? AND user_id = ?`,
            [id, userId]
        );

        if (!targetMember) {
            return next(new AppError('Member not found', 404));
        }

        if (targetMember.role === 'owner') {
            return next(new AppError('Cannot modify owner role', 403));
        }

        await db.run(
            `UPDATE organization_members 
             SET role = COALESCE(?, role),
                 department = COALESCE(?, department)
             WHERE organization_id = ? AND user_id = ?`,
            [role, department, id, userId]
        );

        logger.info('Member role updated', { orgId: id, userId, newRole: role });

        res.json({ success: true, message: 'Member updated' });
    } catch (error) {
        next(error);
    }
});

// Remove member
router.delete('/:id/members/:userId', async (req, res, next) => {
    try {
        const requesterId = req.headers['x-user-id'];
        const { id, userId } = req.params;

        if (!requesterId) {
            return next(new AppError('Unauthorized', 401));
        }

        // Check requester permissions
        const requester = await db.get(
            `SELECT role FROM organization_members 
             WHERE organization_id = ? AND user_id = ?`,
            [id, requesterId]
        );

        if (!requester || !['owner', 'admin'].includes(requester.role)) {
            return next(new AppError('Insufficient permissions', 403));
        }

        // Cannot remove owner
        const targetMember = await db.get(
            `SELECT role FROM organization_members 
             WHERE organization_id = ? AND user_id = ?`,
            [id, userId]
        );

        if (!targetMember) {
            return next(new AppError('Member not found', 404));
        }

        if (targetMember.role === 'owner') {
            return next(new AppError('Cannot remove owner', 403));
        }

        await db.run(
            `DELETE FROM organization_members 
             WHERE organization_id = ? AND user_id = ?`,
            [id, userId]
        );

        logger.info('Member removed', { orgId: id, userId });

        res.json({ success: true, message: 'Member removed' });
    } catch (error) {
        next(error);
    }
});

// ============================================
// INVITATIONS
// ============================================

// Get invitation details
router.get('/invitations/:token', async (req, res, next) => {
    try {
        const { token } = req.params;

        const invitation = await db.get(
            `SELECT i.*, o.name as organization_name
             FROM invitations i
             INNER JOIN organizations o ON i.organization_id = o.id
             WHERE i.token = ? AND i.accepted_at IS NULL AND i.expires_at > datetime('now')`,
            [token]
        );

        if (!invitation) {
            return next(new AppError('Invalid or expired invitation', 404));
        }

        res.json({
            success: true,
            data: {
                organizationName: invitation.organization_name,
                role: invitation.role,
                department: invitation.department,
                expiresAt: invitation.expires_at
            }
        });
    } catch (error) {
        next(error);
    }
});

// Accept invitation
router.post('/invitations/:token/accept', async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        const { token } = req.params;

        if (!userId) {
            return next(new AppError('Unauthorized', 401));
        }

        const invitation = await db.get(
            `SELECT * FROM invitations 
             WHERE token = ? AND accepted_at IS NULL AND expires_at > datetime('now')`,
            [token]
        );

        if (!invitation) {
            return next(new AppError('Invalid or expired invitation', 404));
        }

        // Check if user's email matches (assuming userId is email)
        if (invitation.email.toLowerCase() !== userId.toLowerCase()) {
            return next(new AppError('Invitation email does not match logged-in user', 403));
        }

        // Add to organization
        await db.run(
            `INSERT INTO organization_members (organization_id, user_id, role, department, invited_by, joined_at)
             VALUES (?, ?, ?, ?, ?, datetime('now'))`,
            [invitation.organization_id, userId, invitation.role, invitation.department, invitation.invited_by]
        );

        // Mark invitation as accepted
        await db.run(
            `UPDATE invitations SET accepted_at = datetime('now') WHERE id = ?`,
            [invitation.id]
        );

        logger.info('Invitation accepted', { userId, orgId: invitation.organization_id });

        res.json({
            success: true,
            message: 'Joined organization',
            data: {
                organizationId: invitation.organization_id
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
